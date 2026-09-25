'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import type { DrivePhoto, GalleryMode, PublicGallery } from '@/types';
import { useSelection, MAX_SELECTION } from '@/hooks/useSelection';
import { buildSelectionMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import GalleryNavbar from './GalleryNavbar';
import GalleryFooter from './GalleryFooter';
import FinalDeliveryBanner from './FinalDeliveryBanner';
import MasonryGrid from './MasonryGrid';
import LightboxModal from './LightboxModal';
import SelectionBar from './SelectionBar';
import PinModal from './PinModal';
import CompletionModal from './CompletionModal';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '523122247792';
const CLIENT_FLAG_PREFIX = 'dz-client-verified-';

export default function GalleryExperience({ gallery }: { gallery: PublicGallery }) {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [mode, setMode] = useState<GalleryMode>('seleccion');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInfoMessage, setPinInfoMessage] = useState<string | undefined>(undefined);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'selected'>('all');
  const [completionOpen, setCompletionOpen] = useState(false);

  const { selected, isSelected, toggle } = useSelection(gallery.slug);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const verified = localStorage.getItem(`${CLIENT_FLAG_PREFIX}${gallery.slug}`) === '1';
    setIsClient(verified);
  }, [gallery.slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadPhotos() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/gallery/${gallery.slug}/photos`);
        const data = (await res.json()) as {
          error?: string;
          photos: DrivePhoto[];
          mode?: GalleryMode;
        };
        if (!res.ok) throw new Error(data.error ?? 'No se pudieron cargar las fotos.');
        if (!cancelled) {
          setPhotos(data.photos);
          setMode(data.mode === 'entrega-final' ? 'entrega-final' : 'seleccion');
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Error inesperado.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [gallery.slug]);

  useEffect(() => {
    if (
      mode === 'seleccion' &&
      selected.length === MAX_SELECTION &&
      prevCountRef.current < MAX_SELECTION
    ) {
      setCompletionOpen(true);
    }
    prevCountRef.current = selected.length;
  }, [selected.length, mode]);

  const visiblePhotos = useMemo(
    () => (filter === 'selected' ? photos.filter((p) => isSelected(p.id)) : photos),
    [filter, photos, isSelected]
  );

  const selectedFileNames = useMemo(
    () => photos.filter((p) => selected.includes(p.id)).map((p) => p.name),
    [photos, selected]
  );

  async function verifyPin(pin: string): Promise<boolean> {
    const res = await fetch(`/api/gallery/${gallery.slug}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = (await res.json()) as { valid?: boolean };

    if (data.valid) {
      setIsClient(true);
      localStorage.setItem(`${CLIENT_FLAG_PREFIX}${gallery.slug}`, '1');
      setPinModalOpen(false);
      setPinInfoMessage(undefined);
    }

    return Boolean(data.valid);
  }

  function handleLockedAction() {
    setPinInfoMessage('Modo lectura. Para seleccionar o descargar fotos ingresa tu PIN de Cliente.');
    setPinModalOpen(true);
  }

  function handleToggleSelect(photo: DrivePhoto) {
    if (!isClient) {
      handleLockedAction();
      return;
    }
    toggle(photo.id);
  }

  function handleDownload(photo: DrivePhoto) {
    if (!isClient) {
      handleLockedAction();
      return;
    }
    window.open(`/api/gallery/${gallery.slug}/download?fileId=${photo.id}`, '_blank');
  }

  function handleDownloadAll() {
    if (!isClient) {
      handleLockedAction();
      return;
    }
    window.open(`/api/gallery/${gallery.slug}/download-all`, '_blank');
  }

  function whatsAppMessage() {
    return buildSelectionMessage('Cliente', gallery.clientName, selectedFileNames);
  }

  function handleSendWhatsApp() {
    const link = buildWhatsAppLink(WHATSAPP_NUMBER, whatsAppMessage());
    window.open(link, '_blank');
  }

  function handleCopyList() {
    navigator.clipboard.writeText(selectedFileNames.join(', '));
  }

  return (
    <div className="min-h-screen pb-28">
      <GalleryNavbar
        clientName={gallery.clientName}
        isClient={isClient}
        onOpenPinModal={() => {
          setPinInfoMessage(undefined);
          setPinModalOpen(true);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-semibold text-offwhite sm:text-3xl">
            {gallery.clientName}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {mode === 'entrega-final'
              ? 'Descarga tus fotos finales en la calidad original desde cada tarjeta o en un solo archivo.'
              : isClient
                ? `Selecciona hasta ${MAX_SELECTION} fotos para retoque tocando el corazón.`
                : 'Estás viendo esta galería en modo lectura. Ingresa tu PIN para seleccionar y descargar.'}
          </p>
        </motion.div>

        {!loading && !loadError && mode === 'entrega-final' && photos.length > 0 && (
          <FinalDeliveryBanner canInteract={isClient} onDownloadAll={handleDownloadAll} />
        )}

        {loading && (
          <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer mb-4 w-full rounded-xl"
                style={{ aspectRatio: i % 3 === 0 ? '3 / 4' : '4 / 3', breakInside: 'avoid' }}
              />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <ImageOff className="h-10 w-10 text-white/30" />
            <p className="text-sm text-white/50">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && visiblePhotos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <ImageOff className="h-10 w-10 text-white/30" />
            <p className="text-sm text-white/50">
              {filter === 'selected'
                ? 'Aún no has seleccionado ninguna foto.'
                : 'Esta galería todavía no tiene fotos.'}
            </p>
          </div>
        )}

        {!loading && !loadError && visiblePhotos.length > 0 && (
          <MasonryGrid
            photos={visiblePhotos}
            mode={mode}
            isSelected={isSelected}
            onToggleSelect={handleToggleSelect}
            onOpenLightbox={(index) => setLightboxIndex(index)}
            onDownload={handleDownload}
            canInteract={isClient}
            onLockedAction={handleLockedAction}
          />
        )}
      </main>

      <GalleryFooter />

      <LightboxModal
        photos={visiblePhotos}
        mode={mode}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        isSelected={isSelected}
        onToggleSelect={handleToggleSelect}
        onDownload={handleDownload}
        canInteract={isClient}
        onLockedAction={handleLockedAction}
      />

      <SelectionBar
        visible={mode === 'seleccion' && isClient && photos.length > 0}
        count={selected.length}
        max={MAX_SELECTION}
        filter={filter}
        onFilterChange={setFilter}
        onSend={handleSendWhatsApp}
      />

      <PinModal
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onVerify={verifyPin}
        infoMessage={pinInfoMessage}
      />

      <CompletionModal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        onSendWhatsApp={handleSendWhatsApp}
        onCopyList={handleCopyList}
      />
    </div>
  );
}
