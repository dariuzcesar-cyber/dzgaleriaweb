import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/googleAuth';
import { createGallery, listGalleries, deleteGallery } from '@/lib/galleries';
import { getEnvVar } from '@/lib/env';

export const runtime = 'edge';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.email !== getEnvVar('ALLOWED_ADMIN_EMAIL')) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const galleries = await listGalleries();
  return NextResponse.json({ galleries });
}

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'El PIN debe tener exactamente 4 dígitos.' }, { status: 400 });
  }

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return NextResponse.json(
      { error: 'El slug solo puede contener minúsculas, números y guiones.' },
      { status: 400 }
    );
  }

  try {
    const gallery = await createGallery({ clientName, slug, driveFolderId, pin });
    return NextResponse.json({ gallery }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear la galería.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
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
}
