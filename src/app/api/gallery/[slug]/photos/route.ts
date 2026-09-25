import { NextResponse } from 'next/server';
import { getGalleryBySlug } from '@/lib/galleries';
import { listPhotosInFolder, resolveGalleryFolder } from '@/lib/googleDrive';

export const runtime = 'edge';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  try {
    const { folderId, mode } = await resolveGalleryFolder(gallery.driveFolderId);
    const photos = await listPhotosInFolder(folderId);
    return NextResponse.json({ photos, mode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al cargar las fotos desde Google Drive.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
