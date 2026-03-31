'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useSavedSlugs } from '@/hooks/use-saved-slugs';

export function SaveButton({
  slug,
  className,
  size = 'icon',
}: {
  slug: string;
  className?: string;
  size?: 'sm' | 'icon';
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { isSaved, toggleSaved, togglePending, toggleError } = useSavedSlugs();
  const saved = user ? isSaved(slug) : false;

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn('relative', className)}
      disabled={!!user && togglePending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          const next =
            typeof window !== 'undefined'
              ? window.location.pathname + window.location.search
              : '/opportunities';
          router.push(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        void toggleSaved(slug);
      }}
      aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
      title={toggleError?.message}
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
              saved
                ? 'fill-red-500 text-red-500 dark:fill-rose-400 dark:text-rose-400'
                : 'text-muted-foreground'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
