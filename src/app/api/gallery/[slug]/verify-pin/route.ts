import { NextResponse } from 'next/server';
import { getGalleryBySlug } from '@/lib/galleries';

export const runtime = 'edge';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const gallery = await getGalleryBySlug(params.slug);

    if (!gallery) {
      return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
    }

    const { pin } = (await request.json()) as { pin?: string };

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
  } catch (error) {
    console.error('Error verificando el PIN:', error);
    const message = error instanceof Error ? error.message : 'Error inesperado.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
