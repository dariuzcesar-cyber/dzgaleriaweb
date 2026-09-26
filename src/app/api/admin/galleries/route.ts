import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/googleAuth';
import { createGallery, listGalleries, deleteGallery } from '@/lib/galleries';
import { getEnvVar } from '@/lib/env';
import { extractDriveFolderId, isValidDriveId } from '@/lib/googleDrive';

export const runtime = 'edge';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.email !== getEnvVar('ALLOWED_ADMIN_EMAIL')) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const galleries = await listGalleries();
    return NextResponse.json({ galleries });
  } catch (error) {
    console.error('Error listando galerías:', error);
    const message = error instanceof Error ? error.message : 'Error inesperado.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      clientName?: string;
      slug?: string;
      driveFolderId?: string;
      pin?: string;
    };
    const { clientName, slug, driveFolderId, pin } = body ?? {};

    if (!clientName || !slug || !driveFolderId || !pin) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'El PIN debe tener exactamente 4 dígitos.' },
        { status: 400 }
      );
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'El slug solo puede contener minúsculas, números y guiones.' },
        { status: 400 }
      );
    }

    const cleanedFolderId = extractDriveFolderId(driveFolderId);
    if (!isValidDriveId(cleanedFolderId)) {
      return NextResponse.json(
        { error: 'El ID o enlace de la carpeta de Google Drive no es válido.' },
        { status: 400 }
      );
    }

    const gallery = await createGallery({
      clientName,
      slug,
      driveFolderId: cleanedFolderId,
      pin,
    });
    return NextResponse.json({ gallery }, { status: 201 });
  } catch (error) {
    console.error('Error creando galería:', error);
    const message = error instanceof Error ? error.message : 'Error al crear la galería.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la galería.' }, { status: 400 });
    }

    await deleteGallery(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando galería:', error);
    const message = error instanceof Error ? error.message : 'Error inesperado.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
