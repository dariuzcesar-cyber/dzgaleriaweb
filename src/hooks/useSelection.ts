'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToggleResult = 'added' | 'removed' | 'limit-reached';

export function useSelection(slug: string, maxSelection: number) {
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

  const toggle = useCallback(
    (id: string): ToggleResult => {
      let result: ToggleResult = 'added';

      setSelected((prev) => {
        if (prev.includes(id)) {
          result = 'removed';
          return prev.filter((p) => p !== id);
        }
        if (prev.length >= maxSelection) {
          result = 'limit-reached';
          return prev;
        }
        result = 'added';
        return [...prev, id];
      });

      return result;
    },
    [maxSelection]
  );

  const clear = useCallback(() => setSelected([]), []);

  return { selected, isSelected, toggle, clear, hydrated, max: maxSelection };
}
