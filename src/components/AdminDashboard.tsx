'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { Gallery } from '@/types';
import GalleryForm from './GalleryForm';
import GalleryCard from './GalleryCard';

interface AdminDashboardProps {
  adminName: string;
  adminEmail: string;
  initialGalleries: Gallery[];
}

export default function AdminDashboard({
  adminName,
  adminEmail,
  initialGalleries,
}: AdminDashboardProps) {
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries);

  function handleCreated(gallery: Gallery) {
    setGalleries((prev) => [gallery, ...prev]);
  }

  async function handleDelete(id: string) {
    setGalleries((prev) => prev.filter((g) => g.id !== id));
    await fetch('/api/admin/galleries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/dzlogo.png" alt="Dariuz Aceves" width={40} height={40} />
          <div>
            <h1 className="font-display text-lg font-semibold text-offwhite">
              Panel de Administrador
            </h1>
            <p className="text-xs text-white/50">{adminEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Image
            src="/perfildz.jpg"
            alt={adminName}
            width={40}
            height={40}
            className="rounded-full border border-glassborder object-cover"
          />
          <a
            href="/api/admin/auth/logout"
            className="flex items-center gap-1.5 rounded-full border border-glassborder px-3 py-2 text-xs text-white/60 transition hover:border-red-400/40 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </a>
        </div>
      </header>

      <div className="space-y-8">
        <GalleryForm onCreated={handleCreated} />

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-offwhite">
            Galerías Activas
          </h2>
          {galleries.length === 0 ? (
            <p className="text-sm text-white/50">
              Aún no has creado ninguna galería. Usa el formulario de arriba para comenzar.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {galleries.map((gallery) => (
                  <GalleryCard key={gallery.id} gallery={gallery} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
