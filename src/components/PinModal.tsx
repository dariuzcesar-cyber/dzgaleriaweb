'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, X, Loader2 } from 'lucide-react';

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  infoMessage?: string;
}

export default function PinModal({ open, onClose, onVerify, infoMessage }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const valid = await onVerify(pin);

    setLoading(false);

    if (!valid) {
      setError('PIN incorrecto. Verifica el código que te compartió Dariuz.');
      return;
    }

    setPin('');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative w-full max-w-sm rounded-2xl p-6 shadow-glass"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 transition hover:text-gold"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <KeyRound className="h-5 w-5 text-gold" />
              </div>
              <h2 className="font-display text-lg font-semibold text-offwhite">
                Ingresa tu PIN de Cliente
              </h2>
              <p className="text-sm text-white/55">
                {infoMessage ??
                  'Desbloquea la selección de favoritas y la descarga de tus fotos.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                autoFocus
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full rounded-lg border border-glassborder bg-charcoal px-4 py-3 text-center text-2xl tracking-[0.5em] text-offwhite outline-none transition focus:border-gold/60"
              />

              {error && <p className="text-center text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:shadow-gold disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ingresar
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
