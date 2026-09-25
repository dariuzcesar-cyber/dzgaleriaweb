import { notFound } from 'next/navigation';
import { getGalleryBySlug, toPublicGallery } from '@/lib/galleries';
import GalleryExperience from '@/components/GalleryExperience';

export default async function GalleryPage({ params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    notFound();
  }

  return <GalleryExperience gallery={toPublicGallery(gallery)} />;
}
