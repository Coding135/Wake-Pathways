'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, ArrowLeft, FileText, BarChart3, Users, Link2, Star, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ADMIN_NAV = [
  { label: 'Dashboard', tab: 'overview', icon: BarChart3 },
  { label: 'Submissions', tab: 'submissions', icon: FileText },
  { label: 'Listings', tab: 'listings', icon: Users },
  { label: 'Verification', tab: 'verification', icon: Link2 },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
] as const;

type AdminDataBanner = 'loading' | 'live' | 'sign_in' | 'forbidden' | 'config';

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'overview';
  const onReviewsRoute = pathname.startsWith('/admin/reviews');
  const onReportsRoute = pathname.startsWith('/admin/reports');

  const [dataBanner, setDataBanner] = useState<AdminDataBanner>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/submissions', { credentials: 'same-origin' })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200) setDataBanner('live');
        else if (res.status === 401) setDataBanner('sign_in');
        else if (res.status === 403) setDataBanner('forbidden');
        else if (res.status === 503) setDataBanner('config');
        else setDataBanner('config');
      })
      .catch(() => {
        if (!cancelled) setDataBanner('config');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Wake Pathways Admin</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </div>

      {dataBanner !== 'loading' && dataBanner !== 'live' && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-border bg-warning/10 px-4 py-2 text-center text-sm text-warning">
            {dataBanner === 'sign_in' && (
              <>
                <Badge variant="warning" className="mr-2">
                  Sign in
                </Badge>
                Sign in with a moderator account to load and manage submissions. Listings tabs may still use
                local preview data.
              </>
            )}
            {dataBanner === 'forbidden' && (
              <>
                <Badge variant="warning" className="mr-2">
                  Not authorized
                </Badge>
                Your account is not in REVIEW_MODERATOR_EMAILS. Submissions cannot be loaded.
              </>
            )}
            {dataBanner === 'config' && (
              <>
                <Badge variant="warning" className="mr-2">
                  Configuration
                </Badge>
                Submissions require SUPABASE_SERVICE_ROLE_KEY on the server and REVIEW_MODERATOR_EMAILS for your
                sign-in email. Without them, the queue cannot load.
              </>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1 overflow-x-auto border-b border-border py-2">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            if ('href' in item) {
              const isActive =
                (item.href === '/admin/reviews' && onReviewsRoute) ||
                (item.href === '/admin/reports' && onReportsRoute);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            }
            const { label, tab } = item;
            const isActive = !onReviewsRoute && currentTab === tab;
            const href = tab === 'overview' ? '/admin' : `/admin?tab=${tab}`;
            return (
              <Link
                key={tab}
                href={href}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
