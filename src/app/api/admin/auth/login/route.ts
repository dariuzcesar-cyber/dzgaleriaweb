import { NextResponse } from 'next/server';
import { buildGoogleAuthUrl, generateState, OAUTH_STATE_COOKIE_NAME } from '@/lib/googleAuth';

export const runtime = 'edge';

export async function GET(request: Request) {
  const state = generateState();
  const redirectUri = `${new URL(request.url).origin}/api/admin/auth/callback`;
  const authUrl = buildGoogleAuthUrl(state, redirectUri);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}
