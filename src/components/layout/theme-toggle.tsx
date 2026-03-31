'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && resolvedTheme === 'dark';
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => {
        if (!mounted) return;
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'h-9 w-9 gap-0 bg-white p-0 touch-manipulation dark:bg-transparent',
        'text-foreground',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mounted ? (
        <Icon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4 opacity-40" aria-hidden />
      )}
    </button>
  );
}
