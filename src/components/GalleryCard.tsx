'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Trash2, Pencil, X, Loader2, Save } from 'lucide-react';
import type { Gallery } from '@/types';
import { buildInviteMessage } from '@/lib/whatsapp';

interface GalleryCardProps {
  gallery: Gallery;
  onDelete: (id: string) => void;
  onUpdated: (gallery: Gallery) => void;
}

export default function GalleryCard({ gallery, onDelete, onUpdated }: GalleryCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: gallery.clientName,
    slug: gallery.slug,
    driveFolderId: gallery.driveFolderId,
    pin: gallery.pin,
  });

  async function handleCopyInvite() {
    const message = buildInviteMessage(gallery.clientName, gallery.slug, gallery.pin);
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleStartEdit() {
    setForm({
      clientName: gallery.clientName,
      slug: gallery.slug,
      driveFolderId: gallery.driveFolderId,
      pin: gallery.pin,
    });
    setEditError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/galleries/${gallery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as { error?: string; gallery: Gallery };

      if (!res.ok) {
        throw new Error(data.error ?? 'Error al actualizar la galería.');
      }

      onUpdated(data.gallery);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setSaving(false);
    }
  }

  const createdDate = new Date(gallery.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (editing) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel flex flex-col gap-3 rounded-2xl p-5 shadow-glass"
      >
        <h3 className="font-display text-sm font-semibold text-offwhite">
          Editar galería
        </h3>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-white/50">
            Nombre del Cliente / Sesión
          </label>
          <input
            value={form.clientName}
            onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-white/50">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-white/50">
            Carpeta de Google Drive (ID o enlace completo)
          </label>
          <input
            value={form.driveFolderId}
            onChange={(e) => setForm((f) => ({ ...f, driveFolderId: e.target.value }))}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-white/50">PIN</label>
          <input
            value={form.pin}
            maxLength={4}
            onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm tracking-widest text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        {editError && <p className="text-sm text-red-400">{editError}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-obsidian transition hover:shadow-gold disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Guardar
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full border border-glassborder px-4 py-2 text-xs text-white/60 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        </div>
      </motion.div>
    );
  }

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
          onClick={handleStartEdit}
          className="flex items-center gap-1.5 rounded-full border border-glassborder px-2.5 py-1.5 text-xs text-white/60 transition hover:border-gold/50 hover:text-gold"
        >
          <Pencil className="h-3.5 w-3.5" />
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
