'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'wake-pathways-saved';

/** Stable empty snapshot: useSyncExternalStore requires the same reference from getServerSnapshot (and empty client state). */
const EMPTY_SAVED_SLUGS: string[] = [];

let cachedSerialized = '[]';
let cachedSlugs: string[] = EMPTY_SAVED_SLUGS;

function getSavedSlugs(): string[] {
  if (typeof window === 'undefined') return [...EMPTY_SAVED_SLUGS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...EMPTY_SAVED_SLUGS];
  } catch {
    return [...EMPTY_SAVED_SLUGS];
  }
}

function persistSlugs(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new Event('saved-updated'));
  } catch {
    // localStorage may be unavailable
  }
}

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY_SAVED_SLUGS;
  const raw = localStorage.getItem(STORAGE_KEY);
  let parsed: string[];
  try {
    parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) parsed = [];
  } catch {
    parsed = [];
  }
  const serialized = JSON.stringify(parsed);
  if (serialized !== cachedSerialized) {
    cachedSerialized = serialized;
    cachedSlugs = parsed.length === 0 ? EMPTY_SAVED_SLUGS : [...parsed];
  }
  return cachedSlugs;
}

function getServerSnapshot(): string[] {
  return EMPTY_SAVED_SLUGS;
}

function subscribe(callback: () => void): () => void {
  function handleStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) callback();
  }
  function handleCustom() {
    callback();
  }
  window.addEventListener('storage', handleStorage);
  window.addEventListener('saved-updated', handleCustom);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('saved-updated', handleCustom);
  };
}

export function useSavedOpportunities() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((slug: string) => {
    const current = getSavedSlugs();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    persistSlugs(next);
  }, []);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  return { saved, toggle, isSaved };
}

export function SaveButton({
  slug,
  className,
  size = 'icon',
}: {
  slug: string;
  className?: string;
  size?: 'sm' | 'icon';
}) {
  const { isSaved, toggle } = useSavedOpportunities();
  const saved = isSaved(slug);

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn('relative', className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={saved ? 'saved' : 'unsaved'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              saved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
