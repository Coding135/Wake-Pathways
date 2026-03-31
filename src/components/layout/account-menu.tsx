'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Heart, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { buttonVariants } from '@/components/ui/button';
import {
  getUserDisplayInitial,
  getUserDisplayLabel,
} from '@/lib/auth/user-display';

export function AccountMenu({ className }: { className?: string }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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

  if (!user?.email) return null;

  const displayLabel = getUserDisplayLabel(user, profile);
  const email = user.email.trim();
  const initial = getUserDisplayInitial(displayLabel, email);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ['saved-slugs'] });
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 gap-1.5 bg-white px-2.5 font-medium sm:px-3 dark:bg-transparent',
          'touch-manipulation'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${displayLabel}`}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary sm:hidden"
          aria-hidden
        >
          {initial}
        </span>
        <User className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden />
        <span className="hidden max-w-[100px] truncate sm:inline md:max-w-[140px]">
          {displayLabel}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,260px)] rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Signed in</p>
            <p className="truncate text-sm font-medium text-foreground">{displayLabel}</p>
          </div>
          <Link
            role="menuitem"
            href="/saved"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-secondary"
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
            Saved opportunities
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
