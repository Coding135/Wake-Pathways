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
        buttonVariants({ variant: 'outline', size: 'icon' }),
        'size-9 shrink-0 grid place-items-center p-0 gap-0 rounded-md bg-white touch-manipulation dark:bg-transparent',
        'text-foreground',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mounted ? (
        <Icon className="size-4 shrink-0 block" aria-hidden />
      ) : (
        <Sun className="size-4 shrink-0 block opacity-40" aria-hidden />
      )}
    </button>
  );
}
