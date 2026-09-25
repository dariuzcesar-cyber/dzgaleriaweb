import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { downloadZip } from 'client-zip';
import { getGalleryBySlug } from '@/lib/galleries';
import { listPhotosInFolder, resolveGalleryFolder, getFileResponse } from '@/lib/googleDrive';
import type { DrivePhoto } from '@/types';

export const runtime = 'edge';

// Fetches each Drive file lazily, one at a time, as client-zip consumes the
// generator — this keeps concurrent Drive requests (and memory) bounded
// instead of opening every file's stream up front.
async function* buildZipEntries(photos: DrivePhoto[]) {
  for (const photo of photos) {
    const response = await getFileResponse(photo.id);
    yield { name: photo.name, input: response };
  }
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  const hasAccess = cookies().get(`dz_client_${gallery.slug}`)?.value === 'granted';
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Ingresa tu PIN de cliente para descargar la galería.' },
      { status: 403 }
    );
  }

  try {
    const { folderId } = await resolveGalleryFolder(gallery.driveFolderId);
    const photos = await listPhotosInFolder(folderId);

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'Esta galería no tiene fotos para descargar.' },
        { status: 404 }
      );
    }

    const zipResponse = downloadZip(buildZipEntries(photos));
    const safeName = gallery.clientName.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'galeria';

    return new NextResponse(zipResponse.body, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeName}-galeria-completa.zip"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al generar la descarga.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
