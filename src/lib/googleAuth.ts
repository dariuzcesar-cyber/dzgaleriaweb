import { cookies } from 'next/headers';
import {
  base64UrlFromBytes,
  base64UrlFromString,
  bytesFromBase64Url,
  jsonFromBase64Url,
} from './base64url';
import { requireEnvVar } from './env';

// A minimal, hand-rolled Google OAuth2 (OIDC) admin-gate flow, using only
// fetch + Web Crypto — no NextAuth. NextAuth v4's core (CSRF via Node
// `crypto`, its legacy OAuth1 client needing `http`/`https`/`querystring`,
// and `openid-client`'s runtime behavior) is not viable on Cloudflare's
// Edge runtime; see the project history for the three layers of failures
// that led here. This only needs to gate a single admin email, so a full
// auth library is more surface area than the problem calls for.

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

const SESSION_COOKIE = 'dz_admin_session';
const OAUTH_STATE_COOKIE = 'dz_oauth_state';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlFromBytes(new Uint8Array(signature));
}

// --- Authorization Code flow -----------------------------------------

export function buildGoogleAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: requireEnvVar('GOOGLE_CLIENT_ID'),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForIdToken(code: string, redirectUri: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: requireEnvVar('GOOGLE_CLIENT_ID'),
      client_secret: requireEnvVar('GOOGLE_CLIENT_SECRET'),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`No se pudo intercambiar el código de Google (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error('Google no devolvió un id_token.');
  return data.id_token;
}

// --- ID token verification (RS256 against Google's rotating JWKS) -----

interface GoogleJwk {
  kty: string;
  kid: string;
  n: string;
  e: string;
}

interface GoogleIdTokenPayload {
  iss: string;
  aud: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  exp: number;
}

let cachedJwks: { keys: GoogleJwk[]; fetchedAt: number } | null = null;
const JWKS_CACHE_MS = 10 * 60 * 1000;

async function getGoogleJwks(forceRefresh = false): Promise<GoogleJwk[]> {
  if (!forceRefresh && cachedJwks && Date.now() - cachedJwks.fetchedAt < JWKS_CACHE_MS) {
    return cachedJwks.keys;
  }
  const res = await fetch(GOOGLE_JWKS_ENDPOINT);
  if (!res.ok) {
    throw new Error(`No se pudieron obtener las llaves públicas de Google (${res.status}).`);
  }
  const data = (await res.json()) as { keys: GoogleJwk[] };
  cachedJwks = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  const [headerB64, payloadB64, signatureB64] = idToken.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Token de Google con formato inválido.');
  }

  const header = jsonFromBase64Url<{ kid?: string }>(headerB64);
  const payload = jsonFromBase64Url<GoogleIdTokenPayload>(payloadB64);

  if (!header.kid) throw new Error('El token de Google no incluye "kid".');

  let jwks = await getGoogleJwks();
  let jwk = jwks.find((k) => k.kid === header.kid);

  if (!jwk) {
    jwks = await getGoogleJwks(true);
    jwk = jwks.find((k) => k.kid === header.kid);
  }

  if (!jwk) throw new Error('No se encontró la llave pública de Google para este token.');

  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    bytesFromBase64Url(signatureB64) as BufferSource,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  if (!isValid) throw new Error('La firma del token de Google no es válida.');
  if (!GOOGLE_ISSUERS.includes(payload.iss)) throw new Error('Emisor del token inesperado.');
  if (payload.aud !== requireEnvVar('GOOGLE_CLIENT_ID')) {
    throw new Error('El token no corresponde a esta aplicación.');
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('El token de Google expiró.');

  return payload;
}

// --- Our own signed session cookie (replaces NextAuth's session) -----

export interface AdminSession {
  email: string;
  name: string | null;
}

export async function createSessionToken(email: string, name: string | null): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const encodedPayload = base64UrlFromString(JSON.stringify({ email, name, exp }));
  const signature = await hmacSign(requireEnvVar('SESSION_SECRET'), encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await hmacSign(requireEnvVar('SESSION_SECRET'), encodedPayload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const payload = jsonFromBase64Url<{ email: string; name: string | null; exp: number }>(
      encodedPayload
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
export const OAUTH_STATE_COOKIE_NAME = OAUTH_STATE_COOKIE;

export function generateState(): string {
  return base64UrlFromBytes(crypto.getRandomValues(new Uint8Array(16)));
}
