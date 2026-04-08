'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Shield,
  ArrowLeft,
  FileText,
  BarChart3,
  Users,
  Link2,
  Star,
  Flag,
  MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ADMIN_NAV = [
  { label: 'Dashboard', tab: 'overview', icon: BarChart3 },
  { label: 'Submissions', tab: 'submissions', icon: FileText },
  { label: 'Listings', tab: 'listings', icon: Users },
  { label: 'Verification', tab: 'verification', icon: Link2 },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquareText },
] as const;

type AdminDataBanner = 'loading' | 'live' | 'sign_in' | 'notice';

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'overview';
  const onReviewsRoute = pathname.startsWith('/admin/reviews');
  const onReportsRoute = pathname.startsWith('/admin/reports');
  const onFeedbackRoute = pathname.startsWith('/admin/feedback');

  const [dataBanner, setDataBanner] = useState<AdminDataBanner>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/submissions', { credentials: 'same-origin' })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200) setDataBanner('live');
        else if (res.status === 401) setDataBanner('sign_in');
        else setDataBanner('notice');
      })
      .catch(() => {
        if (!cancelled) setDataBanner('notice');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
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
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="border-b border-border bg-warning/10 px-3 py-2.5 text-center text-sm text-warning sm:px-4">
            {dataBanner === 'sign_in' && (
              <>
                <Badge variant="warning" className="mr-2">
                  Session
                </Badge>
                Your session may have expired. Sign in again to load submissions and moderation queues.
              </>
            )}
            {dataBanner === 'notice' && (
              <>
                <Badge variant="warning" className="mr-2">
                  Submissions API
                </Badge>
                Could not load the submissions queue. Confirm SUPABASE_SERVICE_ROLE_KEY is set on the server and
                try again.
              </>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <nav className="-mx-1 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border py-2 pb-2.5 [-webkit-overflow-scrolling:touch]">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            if ('href' in item) {
              const isActive =
                (item.href === '/admin/reviews' && onReviewsRoute) ||
                (item.href === '/admin/reports' && onReportsRoute) ||
                (item.href === '/admin/feedback' && onFeedbackRoute);
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
            const isActive =
              !onReviewsRoute &&
              !onReportsRoute &&
              !onFeedbackRoute &&
              currentTab === tab;
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

      <main className="mx-auto min-w-0 max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
