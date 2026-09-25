'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied({ email }: { email?: string | null }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel flex flex-col items-center gap-5 rounded-2xl px-8 py-10 shadow-glass"
      >
        <Image src="/dzlogo.png" alt="Dariuz Aceves" width={64} height={64} />
        <ShieldAlert className="h-10 w-10 text-gold" strokeWidth={1.5} />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-offwhite">
            Acceso Denegado
          </h1>
          <p className="max-w-sm text-sm text-white/60">
            Este panel es privado y exclusivo del administrador del estudio.
            {email && (
              <>
                {' '}
                La cuenta <span className="text-white/80">{email}</span> no tiene permisos.
              </>
            )}
          </p>
        </div>
        <a
          href="/"
          className="mt-2 rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition hover:border-gold/50 hover:text-gold"
        >
          Volver al inicio
        </a>
      </motion.div>
    </main>
  );
}
