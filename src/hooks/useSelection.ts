'use client';

import { useCallback, useEffect, useState } from 'react';

export const MAX_SELECTION = 30;

export function useSelection(slug: string) {
  const storageKey = `dz-selection-${slug}`;
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setSelected(JSON.parse(raw));
    } catch {
      // localStorage unavailable — selection simply won't persist.
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [selected, hydrated, storageKey]);

  const isSelected = useCallback((id: string) => selected.includes(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= MAX_SELECTION) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  return { selected, isSelected, toggle, clear, hydrated, max: MAX_SELECTION };
}
