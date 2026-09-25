import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Gallery, PublicGallery } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'galleries.json');

async function readAll(): Promise<Gallery[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Gallery[];
  } catch {
    return [];
  }
}

async function writeAll(galleries: Gallery[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(galleries, null, 2), 'utf-8');
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
    id: randomUUID(),
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
