import type { DrivePhoto, GalleryMode } from '@/types';
import { base64UrlFromBytes, base64UrlFromString } from './base64url';
import { getEnvVar } from './env';

const FINAL_DELIVERY_FOLDER_NAMES = ['finales', 'retocadas'];
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';

// The `googleapis` SDK relies on Node's `http`/`https`/`fs` modules, which
// don't exist on Cloudflare's Edge/Workers runtime. Everything below talks
// to the Drive REST API directly via `fetch`, and signs the service-account
// JWT with the Web Crypto API (`crypto.subtle`) instead of Node's `crypto`.

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signServiceAccountJwt(clientEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64UrlFromString(JSON.stringify(header))}.${base64UrlFromString(
    JSON.stringify(payload)
  )}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64UrlFromBytes(new Uint8Array(signature))}`;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientEmail = getEnvVar('GOOGLE_CLIENT_EMAIL');
  const privateKey = getEnvVar('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Faltan credenciales de la Service Account de Google Drive (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).'
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const assertion = await signServiceAccountJwt(clientEmail, privateKey);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo autenticar con la cuenta de servicio de Google Drive (${res.status}).`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function driveFetch(path: string): Promise<unknown> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${DRIVE_API}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error de Google Drive (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

function classifyOrientation(
  width: number | null,
  height: number | null
): DrivePhoto['orientation'] {
  if (!width || !height) return 'horizontal';
  const ratio = width / height;
  if (ratio > 1.9) return 'panoramic';
  if (ratio > 1.05) return 'horizontal';
  if (ratio < 0.95) return 'vertical';
  return 'square';
}

interface DriveFile {
  id?: string;
  name?: string;
  mimeType?: string;
  thumbnailLink?: string;
  imageMediaMetadata?: { width?: number; height?: number };
}

interface DriveFileListResponse {
  files?: DriveFile[];
  nextPageToken?: string;
}

export async function listPhotosInFolder(folderId: string): Promise<DrivePhoto[]> {
  const photos: DrivePhoto[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'nextPageToken, files(id, name, imageMediaMetadata(width, height), thumbnailLink)',
      pageSize: '200',
      orderBy: 'name_natural',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const data = (await driveFetch(`files?${params.toString()}`)) as DriveFileListResponse;

    for (const file of data.files ?? []) {
      if (!file.id || !file.name) continue;
      const width = file.imageMediaMetadata?.width ?? null;
      const height = file.imageMediaMetadata?.height ?? null;

      photos.push({
        id: file.id,
        name: file.name,
        thumbnailUrl: file.thumbnailLink
          ? file.thumbnailLink.replace(/=s\d+$/, '=s1200')
          : `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
        viewUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
        width,
        height,
        orientation: classifyOrientation(width, height),
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return photos;
}

async function findFinalDeliveryFolder(parentFolderId: string): Promise<string | null> {
  const params = new URLSearchParams({
    q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: '50',
  });

  const data = (await driveFetch(`files?${params.toString()}`)) as DriveFileListResponse;

  const match = (data.files ?? []).find((folder) =>
    FINAL_DELIVERY_FOLDER_NAMES.includes((folder.name ?? '').trim().toLowerCase())
  );

  return match?.id ?? null;
}

export async function resolveGalleryFolder(
  baseFolderId: string
): Promise<{ folderId: string; mode: GalleryMode }> {
  const finalFolderId = await findFinalDeliveryFolder(baseFolderId);

  if (finalFolderId) {
    return { folderId: finalFolderId, mode: 'entrega-final' };
  }

  return { folderId: baseFolderId, mode: 'seleccion' };
}

/** Raw, still-streaming fetch Response for a file's binary content. */
export async function getFileResponse(fileId: string): Promise<Response> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudo descargar el archivo de Google Drive (${res.status}).`);
  }

  return res;
}

export async function downloadFile(
  fileId: string
): Promise<{ body: ReadableStream<Uint8Array> | null; mimeType: string; name: string }> {
  const meta = (await driveFetch(`files/${fileId}?fields=name,mimeType`)) as DriveFile;
  const fileRes = await getFileResponse(fileId);

  return {
    body: fileRes.body,
    mimeType: meta.mimeType ?? 'application/octet-stream',
    name: meta.name ?? 'foto.jpg',
  };
}

// Google Drive IDs are alphanumeric plus `-`/`_`, typically 25-44 chars.
const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,}$/;

// Extracts a folder/file ID from the various URL shapes Google Drive's
// "Share" dialog can produce, or passes the input through unchanged if it
// isn't a recognizable URL (assumed to already be a raw ID). Matching only
// `[a-zA-Z0-9_-]` means characters that were never valid in a Drive ID to
// begin with — e.g. a stray `|` from a copy-paste/font-rendering mixup —
// can't end up in the extracted result when a full URL is pasted.
export function extractDriveFolderId(input: string): string {
  const trimmed = input.trim();

  const patterns = [/\/folders\/([a-zA-Z0-9_-]+)/, /\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return trimmed;
}

export function isValidDriveId(id: string): boolean {
  return DRIVE_ID_PATTERN.test(id);
}
