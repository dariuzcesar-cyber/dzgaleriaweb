'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Plus, Loader2 } from 'lucide-react';
import type { Gallery } from '@/types';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function randomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

interface GalleryFormProps {
  onCreated: (gallery: Gallery) => void;
}

export default function GalleryForm({ onCreated }: GalleryFormProps) {
  const [clientName, setClientName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState('');
  const [pin, setPin] = useState(randomPin());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClientNameChange(value: string) {
    setClientName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, slug, driveFolderId, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Error al crear la galería.');
      }

      onCreated(data.gallery);
      setClientName('');
      setSlug('');
      setSlugTouched(false);
      setDriveFolderId('');
      setPin(randomPin());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel space-y-5 rounded-2xl p-6 shadow-glass"
    >
      <h2 className="font-display text-lg font-semibold text-offwhite">
        Nueva Galería
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-white/50">
            Nombre del Cliente / Sesión
          </label>
          <input
            required
            value={clientName}
            onChange={(e) => handleClientNameChange(e.target.value)}
            placeholder="María - Maternidad"
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-white/50">
            Slug para la URL
          </label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="maternidad-maria"
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-white/50">
            ID de carpeta de Google Drive
          </label>
          <input
            required
            value={driveFolderId}
            onChange={(e) => setDriveFolderId(e.target.value)}
            placeholder="1A2b3C4d5E6f..."
            className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm text-offwhite outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-white/50">
            PIN de cliente (4 dígitos)
          </label>
          <div className="flex gap-2">
            <input
              required
              value={pin}
              maxLength={4}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-lg border border-glassborder bg-charcoal px-3 py-2 text-sm tracking-widest text-offwhite outline-none transition focus:border-gold/60"
            />
            <button
              type="button"
              onClick={() => setPin(randomPin())}
              title="Generar PIN aleatorio"
              className="flex items-center justify-center rounded-lg border border-glassborder px-3 text-white/60 transition hover:border-gold/50 hover:text-gold"
            >
              <Dices className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-obsidian transition hover:shadow-gold disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Crear galería
      </button>
    </motion.form>
  );
}
