import { NextResponse } from 'next/server';
import { getGalleryBySlug, toPublicGallery } from '@/lib/galleries';

export const runtime = 'edge';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ gallery: toPublicGallery(gallery) });
}
