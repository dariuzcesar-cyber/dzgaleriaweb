'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface LimitReachedToastProps {
  message: string | null;
}

export default function LimitReachedToast({ message }: LimitReachedToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-full border border-gold/40 bg-glass/95 px-4 py-2.5 text-center text-sm text-offwhite shadow-gold backdrop-blur-md"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-gold" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
