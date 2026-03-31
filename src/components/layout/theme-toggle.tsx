'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Check, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const OPTIONS = [
  { value: 'light' as const, label: 'Light', Icon: Sun },
  { value: 'dark' as const, label: 'Dark', Icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const active = theme === 'dark' ? 'dark' : 'light';
  const PreviewIcon = active === 'dark' ? Moon : Sun;

  return (
    <div ref={ref} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 w-9 gap-0 p-0 touch-manipulation',
          'text-foreground'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Theme: light or dark"
      >
        {mounted ? (
          <PreviewIcon className="h-4 w-4" aria-hidden />
        ) : (
          <Sun className="h-4 w-4 opacity-40" aria-hidden />
        )}
      </button>
      {open && mounted && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-40 rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Theme
          </p>
          {OPTIONS.map(({ value, label, Icon }) => {
            const selected = active === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  selected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span className="flex-1">{label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
