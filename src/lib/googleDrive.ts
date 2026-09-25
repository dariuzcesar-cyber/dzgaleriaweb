import { google } from 'googleapis';
import type { DrivePhoto, GalleryMode } from '@/types';

const FINAL_DELIVERY_FOLDER_NAMES = ['finales', 'retocadas'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Faltan credenciales de la Service Account de Google Drive (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).'
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
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

export async function listPhotosInFolder(folderId: string): Promise<DrivePhoto[]> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const photos: DrivePhoto[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:
        'nextPageToken, files(id, name, imageMediaMetadata(width, height), thumbnailLink)',
      pageSize: 200,
      pageToken,
      orderBy: 'name_natural',
    });

    for (const file of res.data.files ?? []) {
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

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return photos;
}

async function findFinalDeliveryFolder(parentFolderId: string): Promise<string | null> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 50,
  });

  const match = (res.data.files ?? []).find((folder) =>
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

export async function getFileStream(fileId: string): Promise<NodeJS.ReadableStream> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

  return res.data as unknown as NodeJS.ReadableStream;
}

export async function downloadFile(
  fileId: string
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; name: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const metadata = await drive.files.get({
    fileId,
    fields: 'name, mimeType',
  });

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return {
    stream: res.data as unknown as NodeJS.ReadableStream,
    mimeType: metadata.data.mimeType ?? 'application/octet-stream',
    name: metadata.data.name ?? 'foto.jpg',
  };
}
