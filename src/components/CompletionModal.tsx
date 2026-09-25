'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Send, Copy, Check, X } from 'lucide-react';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  onSendWhatsApp: () => void;
  onCopyList: () => void;
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.3,
        color: i % 3 === 0 ? '#ffffff' : '#d4af37',
        size: 5 + Math.random() * 5,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: -10, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: 260, rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
          className="absolute left-1/2 top-0 block rounded-sm"
          style={{ width: p.size, height: p.size * 1.6, background: p.color }}
        />
      ))}
    </div>
  );
}

export default function CompletionModal({
  open,
  onClose,
  onSendWhatsApp,
  onCopyList,
}: CompletionModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopyList();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-panel relative w-full max-w-sm overflow-hidden rounded-2xl p-7 text-center shadow-gold"
          >
            <ConfettiBurst />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 transition hover:text-gold"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-gold/15 shadow-gold">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>

              <h2 className="font-display text-xl font-semibold text-offwhite">
                ¡Has completado tus 30 fotos!
              </h2>
              <p className="text-sm text-white/60">
                ¿Deseas enviar tu lista ahora a Dariuz para comenzar el retoque?
              </p>

              <button
                onClick={onSendWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:shadow-gold"
              >
                <Send className="h-4 w-4" />
                Enviar Selección por WhatsApp
              </button>

              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-glassborder px-6 py-2.5 text-sm text-white/70 transition hover:border-gold/50 hover:text-gold"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Lista copiada' : 'Copiar lista de archivos'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
