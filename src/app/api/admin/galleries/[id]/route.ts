import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/googleAuth';
import { updateGallery } from '@/lib/galleries';
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const updates: {
      clientName?: string;
      slug?: string;
      driveFolderId?: string;
      pin?: string;
    } = {};

    if (body.clientName !== undefined) {
      const trimmed = body.clientName.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: 'El nombre del cliente no puede estar vacío.' },
          { status: 400 }
        );
      }
      updates.clientName = trimmed;
    }

    if (body.slug !== undefined) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(body.slug)) {
        return NextResponse.json(
          { error: 'El slug solo puede contener minúsculas, números y guiones.' },
          { status: 400 }
        );
      }
      updates.slug = body.slug;
    }

    if (body.driveFolderId !== undefined) {
      const cleanedFolderId = extractDriveFolderId(body.driveFolderId);
      if (!isValidDriveId(cleanedFolderId)) {
        return NextResponse.json(
          { error: 'El ID o enlace de la carpeta de Google Drive no es válido.' },
          { status: 400 }
        );
      }
      updates.driveFolderId = cleanedFolderId;
    }

    if (body.pin !== undefined) {
      if (!/^\d{4}$/.test(body.pin)) {
        return NextResponse.json(
          { error: 'El PIN debe tener exactamente 4 dígitos.' },
          { status: 400 }
        );
      }
      updates.pin = body.pin;
    }

    const gallery = await updateGallery(params.id, updates);
    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error actualizando galería:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar la galería.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
