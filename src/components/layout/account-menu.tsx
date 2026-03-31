'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Link2,
  LogOut,
  Shield,
  Star,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useAdminView } from '@/contexts/admin-view-context';
import { ADMIN_VIEW_QUICK_LINKS } from '@/lib/admin-view/nav';
import { buttonVariants } from '@/components/ui/button';
import {
  getUserDisplayInitial,
  getUserDisplayLabel,
} from '@/lib/auth/user-display';

const ADMIN_LINK_ICONS: Record<string, LucideIcon> = {
  '/admin': LayoutDashboard,
  '/admin?tab=submissions': ClipboardList,
  '/admin?tab=listings': Users,
  '/admin?tab=verification': Link2,
  '/admin/reviews': Star,
};

export function AccountMenu({ className }: { className?: string }) {
  const { user, profile } = useAuth();
  const { canUseAdminToggle, adminViewOn, setAdminViewOn, clearAdminViewPreference } = useAdminView();
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
    clearAdminViewPreference();
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
          {canUseAdminToggle && (
            <>
              <div className="my-1 border-t border-border" role="presentation" />
              <div className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Admin View</p>
                    <p className="text-xs text-muted-foreground">Shortcuts to admin tools</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={adminViewOn}
                    onClick={() => setAdminViewOn(!adminViewOn)}
                    className={cn(
                      'flex h-7 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      adminViewOn ? 'justify-end bg-primary' : 'justify-start bg-muted'
                    )}
                  >
                    <span
                      className="pointer-events-none block h-6 w-6 shrink-0 rounded-full bg-background shadow-sm ring-1 ring-border/60"
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
              {adminViewOn && (
                <div className="border-t border-border bg-muted/25 py-1 dark:bg-muted/10">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Admin
                  </p>
                  {ADMIN_VIEW_QUICK_LINKS.map((item) => {
                    const Icon = ADMIN_LINK_ICONS[item.href] ?? Shield;
                    return (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {item.label}
                        </span>
                        {'description' in item && item.description ? (
                          <span className="pl-6 text-xs text-muted-foreground">{item.description}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
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
