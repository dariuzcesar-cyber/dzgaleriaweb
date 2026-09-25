import type { Gallery, PublicGallery } from '@/types';
import { kvGet, kvPut } from './kv';

const GALLERIES_KEY = 'galleries';

async function readAll(): Promise<Gallery[]> {
  const raw = await kvGet(GALLERIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Gallery[];
  } catch {
    return [];
  }
}

async function writeAll(galleries: Gallery[]): Promise<void> {
  await kvPut(GALLERIES_KEY, JSON.stringify(galleries));
}

export async function listGalleries(): Promise<Gallery[]> {
  const galleries = await readAll();
  return galleries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getGalleryBySlug(slug: string): Promise<Gallery | null> {
  const galleries = await readAll();
  return galleries.find((g) => g.slug === slug) ?? null;
}

export function toPublicGallery(gallery: Gallery): PublicGallery {
  const { pin, ...rest } = gallery;
  return rest;
}

export async function createGallery(input: {
  clientName: string;
  slug: string;
  driveFolderId: string;
  pin: string;
}): Promise<Gallery> {
  const galleries = await readAll();

  if (galleries.some((g) => g.slug === input.slug)) {
    throw new Error('Ya existe una galería con ese slug.');
  }

  const gallery: Gallery = {
    id: crypto.randomUUID(),
    clientName: input.clientName,
    slug: input.slug,
    driveFolderId: input.driveFolderId,
    pin: input.pin,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  galleries.push(gallery);
  await writeAll(galleries);
  return gallery;
}

export async function deleteGallery(id: string): Promise<void> {
  const galleries = await readAll();
  await writeAll(galleries.filter((g) => g.id !== id));
}

export async function updateGalleryStatus(
  id: string,
  status: Gallery['status']
): Promise<void> {
  const galleries = await readAll();
  const gallery = galleries.find((g) => g.id === id);
  if (gallery) {
    gallery.status = status;
    await writeAll(galleries);
  }
}
