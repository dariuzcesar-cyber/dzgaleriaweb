'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Download, Lock } from 'lucide-react';
import type { DrivePhoto, GalleryMode } from '@/types';

interface LightboxModalProps {
  photos: DrivePhoto[];
  mode: GalleryMode;
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  isSelected: (id: string) => boolean;
  onToggleSelect: (photo: DrivePhoto) => void;
  onDownload: (photo: DrivePhoto) => void;
  canInteract: boolean;
  onLockedAction: () => void;
}

export default function LightboxModal({
  photos,
  mode,
  index,
  onClose,
  onNavigate,
  isSelected,
  onToggleSelect,
  onDownload,
  canInteract,
  onLockedAction,
}: LightboxModalProps) {
  const isFinalDelivery = mode === 'entrega-final';
  const open = index !== null;
  const photo = open ? photos[index as number] : null;

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index !== null && index < photos.length - 1) {
        onNavigate(index + 1);
      }
      if (e.key === 'ArrowLeft' && index !== null && index > 0) {
        onNavigate(index - 1);
      }
    }

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, index, photos.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80 && index !== null && index < photos.length - 1) {
              onNavigate(index + 1);
            } else if (info.offset.x > 80 && index !== null && index > 0) {
              onNavigate(index - 1);
            }
          }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition hover:border-gold/50 hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>

          {index !== null && index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(index - 1);
              }}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition hover:border-gold/50 hover:text-gold sm:left-5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {index !== null && index < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(index + 1);
              }}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition hover:border-gold/50 hover:text-gold sm:right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto flex max-h-[88vh] max-w-[92vw] flex-col items-center gap-4"
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.name}
              className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-glass"
            />

            <div className="flex items-center gap-3 rounded-full border border-glassborder bg-glass/90 px-4 py-2 backdrop-blur-md">
              <span className="text-xs text-white/50">{photo.name}</span>

              {isFinalDelivery ? (
                <button
                  onClick={() => {
                    if (!canInteract) {
                      onLockedAction();
                      return;
                    }
                    onDownload(photo);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-gold/60"
                >
                  {canInteract ? (
                    <Download className="h-4 w-4" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-white/30" />
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (!canInteract) {
                        onLockedAction();
                        return;
                      }
                      onToggleSelect(photo);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      isSelected(photo.id)
                        ? 'border-gold bg-gold/90 text-obsidian'
                        : 'border-white/25 text-white hover:border-gold/60'
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={isSelected(photo.id) ? 'currentColor' : 'none'}
                    />
                  </button>

                  {canInteract ? (
                    isSelected(photo.id) && (
                      <button
                        onClick={() => onDownload(photo)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-gold/60"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-white/30" />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
