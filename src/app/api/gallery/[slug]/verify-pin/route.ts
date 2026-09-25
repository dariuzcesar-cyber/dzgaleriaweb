import { NextResponse } from 'next/server';
import { getGalleryBySlug } from '@/lib/galleries';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  const { pin } = await request.json();

  const valid = typeof pin === 'string' && pin === gallery.pin;

  const response = NextResponse.json({ valid });

  if (valid) {
    response.cookies.set(`dz_client_${gallery.slug}`, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: `/`,
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  return response;
}
