'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Grid2x2, Heart, Send } from 'lucide-react';

interface SelectionBarProps {
  visible: boolean;
  count: number;
  max: number;
  filter: 'all' | 'selected';
  onFilterChange: (filter: 'all' | 'selected') => void;
  onSend: () => void;
}

export default function SelectionBar({
  visible,
  count,
  max,
  filter,
  onFilterChange,
  onSend,
}: SelectionBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-panel fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 flex-col gap-3 rounded-2xl px-4 py-3 shadow-glass sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-offwhite">
            <Heart className="h-4 w-4 text-gold" fill="currentColor" />
            <span>
              <span className="font-semibold text-gold">{count}</span> / {max} fotos
              seleccionadas para retoque
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-glassborder p-0.5 text-xs">
              <button
                onClick={() => onFilterChange('all')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                  filter === 'all' ? 'bg-gold text-obsidian' : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid2x2 className="h-3.5 w-3.5" />
                Ver Todas
              </button>
              <button
                onClick={() => onFilterChange('selected')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                  filter === 'selected' ? 'bg-gold text-obsidian' : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                Seleccionadas
              </button>
            </div>

            {count > 0 && (
              <button
                onClick={onSend}
                className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-xs font-semibold text-obsidian transition hover:shadow-gold"
              >
                <Send className="h-3.5 w-3.5" />
                Enviar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
