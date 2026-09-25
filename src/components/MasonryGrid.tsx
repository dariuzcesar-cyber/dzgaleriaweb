'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Lock } from 'lucide-react';
import clsx from 'clsx';
import type { DrivePhoto, GalleryMode } from '@/types';

interface MasonryGridProps {
  photos: DrivePhoto[];
  mode: GalleryMode;
  isSelected: (id: string) => boolean;
  onToggleSelect: (photo: DrivePhoto) => void;
  onOpenLightbox: (index: number) => void;
  onDownload: (photo: DrivePhoto) => void;
  canInteract: boolean;
  onLockedAction: () => void;
}

function PhotoTile({
  photo,
  index,
  isFeatured,
  isFinalDelivery,
  selected,
  canInteract,
  onToggleSelect,
  onOpen,
  onDownload,
  onLockedAction,
}: {
  photo: DrivePhoto;
  index: number;
  isFeatured: boolean;
  isFinalDelivery: boolean;
  selected: boolean;
  canInteract: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDownload: () => void;
  onLockedAction: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  const aspect =
    photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5';

  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '80px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.04, ease: 'easeOut' }}
      className={clsx(
        'group relative mb-4 w-full overflow-hidden rounded-xl bg-glass break-inside-avoid',
        isFeatured && 'sm:mb-5'
      )}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && (
        <div className="skeleton-shimmer absolute inset-0 rounded-xl" aria-hidden />
      )}

      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 h-full w-full"
        aria-label={`Abrir foto ${photo.name}`}
      >
        <img
          src={photo.thumbnailUrl}
          alt={photo.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={clsx(
            'h-full w-full object-cover transition-all duration-700',
            loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
          )}
        />
      </button>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute right-2.5 top-2.5 flex gap-2">
        {isFinalDelivery ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              if (!canInteract) {
                onLockedAction();
                return;
              }
              onDownload();
            }}
            title={
              canInteract
                ? 'Descargar foto en HD'
                : 'Ingresa tu PIN de Cliente para descargar tus fotos finales.'
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:border-gold/60"
          >
            {canInteract ? <Download className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          </motion.button>
        ) : (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                if (!canInteract) {
                  onLockedAction();
                  return;
                }
                onToggleSelect();
              }}
              title={
                canInteract
                  ? 'Seleccionar para retoque'
                  : 'Modo lectura. Ingresa tu PIN de Cliente para seleccionar fotos.'
              }
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition',
                selected
                  ? 'border-gold bg-gold/90 text-obsidian shadow-gold'
                  : 'border-white/25 bg-black/40 text-white hover:border-gold/60'
              )}
            >
              <Heart className="h-4 w-4" fill={selected ? 'currentColor' : 'none'} />
            </motion.button>

            {selected && canInteract && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                title="Descargar foto"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:border-gold/60"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            )}

            {!canInteract && (
              <div
                title="Modo lectura"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/40 backdrop-blur-md"
              >
                <Lock className="h-3.5 w-3.5" />
              </div>
            )}
          </>
        )}
      </div>
    </motion.figure>
  );
}

export default function MasonryGrid({
  photos,
  mode,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onDownload,
  canInteract,
  onLockedAction,
}: MasonryGridProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
      {photos.map((photo, index) => (
        <PhotoTile
          key={photo.id}
          photo={photo}
          index={index}
          isFeatured={index % 7 === 0}
          isFinalDelivery={mode === 'entrega-final'}
          selected={isSelected(photo.id)}
          canInteract={canInteract}
          onToggleSelect={() => onToggleSelect(photo)}
          onOpen={() => onOpenLightbox(index)}
          onDownload={() => onDownload(photo)}
          onLockedAction={onLockedAction}
        />
      ))}
    </div>
  );
}
