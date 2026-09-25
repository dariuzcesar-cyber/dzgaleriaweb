import { notFound } from 'next/navigation';
import { getGalleryBySlug, toPublicGallery } from '@/lib/galleries';
import GalleryExperience from '@/components/GalleryExperience';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function GalleryPage({ params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    notFound();
  }

  return <GalleryExperience gallery={toPublicGallery(gallery)} />;
}
