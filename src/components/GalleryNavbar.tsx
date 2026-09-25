'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle2 } from 'lucide-react';

interface GalleryNavbarProps {
  clientName: string;
  isClient: boolean;
  onOpenPinModal: () => void;
}

export default function GalleryNavbar({
  clientName,
  isClient,
  onOpenPinModal,
}: GalleryNavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-glassborder bg-obsidian/85 px-4 py-3 backdrop-blur-md sm:px-8"
    >
      <div className="flex items-center gap-3">
        <Image src="/dzlogo.png" alt="Dariuz Aceves" width={34} height={34} />
        <div className="hidden sm:block">
          <p className="text-xs uppercase tracking-widest text-white/40">Galería Privada</p>
          <p className="font-display text-sm font-semibold text-offwhite">{clientName}</p>
        </div>
      </div>

      {isClient ? (
        <span className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-2 text-xs font-medium text-gold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Modo Cliente
        </span>
      ) : (
        <button
          onClick={onOpenPinModal}
          className="flex items-center gap-1.5 rounded-full border border-glassborder px-3.5 py-2 text-xs text-white/70 transition hover:border-gold/50 hover:text-gold"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Ingresar PIN de Cliente
        </button>
      )}
    </motion.header>
  );
}
