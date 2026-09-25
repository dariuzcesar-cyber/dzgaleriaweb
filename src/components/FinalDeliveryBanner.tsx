'use client';

import { motion } from 'framer-motion';
import { Sparkles, PackageCheck, Lock } from 'lucide-react';

interface FinalDeliveryBannerProps {
  canInteract: boolean;
  onDownloadAll: () => void;
}

export default function FinalDeliveryBanner({
  canInteract,
  onDownloadAll,
}: FinalDeliveryBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel mb-6 flex flex-col items-center gap-4 rounded-2xl border-gold/30 px-6 py-5 text-center shadow-gold sm:flex-row sm:justify-between sm:text-left"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 shrink-0 text-gold" />
        <p className="font-display text-base font-semibold text-offwhite sm:text-lg">
          ¡Tus fotos finales retocadas están listas!
        </p>
      </div>

      <button
        onClick={onDownloadAll}
        title={
          canInteract
            ? 'Descargar todas las fotos en un solo archivo ZIP'
            : 'Ingresa tu PIN de Cliente para descargar la galería completa.'
        }
        className="flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-obsidian transition hover:shadow-gold"
      >
        {canInteract ? <PackageCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        Descargar Galería Completa (HD)
      </button>
    </motion.div>
  );
}
