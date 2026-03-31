'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, APP_SHORT_NAME } from '@/lib/constants';
import { BRAND_LOGO_MARK_32 } from '@/lib/brand';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { AccountMenu } from '@/components/layout/account-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { getUserDisplayLabel } from '@/lib/auth/user-display';

export function Header() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-md shadow-sm'
          : 'border-transparent bg-background',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
          aria-label="Wake Pathways home"
        >
          <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60 shadow-sm">
            <Image
              src={BRAND_LOGO_MARK_32}
              alt=""
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {APP_SHORT_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth + CTAs — always visible in top bar (not only inside the mobile drawer) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2 md:flex-none md:gap-3">
          <ThemeToggle className="hidden md:block" />
          {user ? (
            <AccountMenu />
          ) : (
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'h-9 px-2.5 text-xs font-semibold sm:px-3 sm:text-sm touch-manipulation'
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'h-9 px-2.5 text-xs font-semibold shadow-sm ring-1 ring-primary/20 sm:px-3 sm:text-sm touch-manipulation'
                )}
              >
                Sign up
              </Link>
            </div>
          )}
          <Link
            href="/submit"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'hidden h-9 gap-2 md:inline-flex'
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Submit an Opportunity</span>
            <span className="lg:hidden">Submit</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden touch-manipulation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 md:hidden">
                  <span className="text-xs font-medium text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground min-w-0">
                    Signed in as{' '}
                    <span className="font-medium text-foreground">
                      {getUserDisplayLabel(user, profile)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobile}
                      className={cn(buttonVariants({ size: 'sm' }), 'w-full')}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
                {user && (
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobile();
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      queryClient.removeQueries({ queryKey: ['saved-slugs'] });
                      router.refresh();
                    }}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full text-destructive')}
                  >
                    Log out
                  </button>
                )}
                <Link href="/submit" onClick={closeMobile} className={cn(buttonVariants({ size: 'sm' }), 'w-full gap-2')}>
                  <Send className="h-3.5 w-3.5" />
                  Submit an Opportunity
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
