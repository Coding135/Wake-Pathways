'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type ThemeChoice = 'light' | 'dark' | 'system';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  const active = (theme ?? 'system') as ThemeChoice;
  const PreviewIcon = active === 'system' ? Monitor : active === 'dark' ? Moon : Sun;

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
        aria-label="Theme: choose light, dark, or system"
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
          className="absolute right-0 z-[60] mt-2 w-44 rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Appearance
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
          {active === 'system' && resolvedTheme && (
            <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
              Using {resolvedTheme === 'dark' ? 'dark' : 'light'} from device
            </p>
          )}
        </div>
      )}
    </div>
  );
}
