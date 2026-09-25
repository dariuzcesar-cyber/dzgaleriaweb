export interface Gallery {
  id: string;
  clientName: string;
  slug: string;
  driveFolderId: string;
  pin: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export type PublicGallery = Omit<Gallery, 'pin'>;

export type GalleryMode = 'seleccion' | 'entrega-final';

export interface DrivePhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  viewUrl: string;
  width: number | null;
  height: number | null;
  orientation: 'vertical' | 'horizontal' | 'panoramic' | 'square';
}
