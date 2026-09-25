'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';

export default function AdminLogin() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel flex flex-col items-center gap-6 rounded-2xl px-10 py-12 shadow-glass"
      >
        <Image src="/dzlogo.png" alt="Dariuz Aceves" width={72} height={72} />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-offwhite">
            Panel de Administrador
          </h1>
          <p className="max-w-xs text-sm text-white/60">
            Acceso exclusivo para el estudio. Inicia sesión con la cuenta de Google
            autorizada.
          </p>
        </div>
        <button
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:shadow-gold"
        >
          Iniciar sesión con Google
        </button>
      </motion.div>
    </main>
  );
}
