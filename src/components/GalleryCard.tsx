'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import type { Gallery } from '@/types';
import { buildInviteMessage } from '@/lib/whatsapp';

interface GalleryCardProps {
  gallery: Gallery;
  onDelete: (id: string) => void;
}

export default function GalleryCard({ gallery, onDelete }: GalleryCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyInvite() {
    const message = buildInviteMessage(gallery.clientName, gallery.slug, gallery.pin);
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const createdDate = new Date(gallery.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel flex flex-col gap-4 rounded-2xl p-5 shadow-glass"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-offwhite">
            {gallery.clientName}
          </h3>
          <p className="text-xs text-white/50">/{gallery.slug}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
            gallery.status === 'active'
              ? 'bg-gold/15 text-gold'
              : 'bg-white/10 text-white/50'
          }`}
        >
          {gallery.status === 'active' ? 'Activa' : 'Archivada'}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <span>Creada el {createdDate}</span>
        <span className="tracking-widest text-white/70">PIN {gallery.pin}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/g/${gallery.slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-glassborder px-3 py-1.5 text-xs text-white/70 transition hover:border-gold/50 hover:text-gold"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver galería
        </a>
        <button
          onClick={handleCopyInvite}
          className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/20"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar invitación WhatsApp'}
        </button>
        <button
          onClick={() => onDelete(gallery.id)}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1.5 text-xs text-white/40 transition hover:border-red-400/40 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
