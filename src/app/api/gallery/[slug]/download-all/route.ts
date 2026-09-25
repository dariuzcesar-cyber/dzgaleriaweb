import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Readable } from 'stream';
import archiver from 'archiver';
import { getGalleryBySlug } from '@/lib/galleries';
import { listPhotosInFolder, resolveGalleryFolder, getFileStream } from '@/lib/googleDrive';

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
      return NextResponse.json({ error: 'Esta galería no tiene fotos para descargar.' }, { status: 404 });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Error generando el ZIP de la galería:', err);
    });

    (async () => {
      for (const photo of photos) {
        const stream = await getFileStream(photo.id);
        archive.append(stream as unknown as Readable, { name: photo.name });
      }
      archive.finalize();
    })();

    const webStream = Readable.toWeb(archive) as unknown as ReadableStream;
    const safeName = gallery.clientName.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'galeria';

    return new NextResponse(webStream, {
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
