import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGalleryBySlug } from '@/lib/galleries';
import { downloadFile } from '@/lib/googleDrive';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  const hasAccess = cookies().get(`dz_client_${gallery.slug}`)?.value === 'granted';
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Ingresa tu PIN de cliente para descargar fotos.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'Falta el identificador del archivo.' }, { status: 400 });
  }

  try {
    const { body, mimeType, name } = await downloadFile(fileId);

    return new NextResponse(body, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${name}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al descargar la foto.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
