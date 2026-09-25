import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  exchangeCodeForIdToken,
  verifyGoogleIdToken,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  OAUTH_STATE_COOKIE_NAME,
} from '@/lib/googleAuth';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expectedState = cookies().get(OAUTH_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/acceso-denegado`);
  }

  try {
    const redirectUri = `${origin}/api/admin/auth/callback`;
    const idToken = await exchangeCodeForIdToken(code, redirectUri);
    const payload = await verifyGoogleIdToken(idToken);

    if (
      !payload.email ||
      !payload.email_verified ||
      payload.email !== process.env.ALLOWED_ADMIN_EMAIL
    ) {
      const response = NextResponse.redirect(`${origin}/acceso-denegado`);
      response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
      return response;
    }

    const sessionToken = await createSessionToken(payload.email, payload.name ?? null);

    const response = NextResponse.redirect(`${origin}/admin`);
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Error en el callback de Google OAuth:', error);
    return NextResponse.redirect(`${origin}/acceso-denegado`);
  }
}
