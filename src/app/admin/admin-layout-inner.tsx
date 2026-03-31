'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, FileText, BarChart3, Users, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ADMIN_NAV = [
  { label: 'Dashboard', tab: 'overview', icon: BarChart3 },
  { label: 'Submissions', tab: 'submissions', icon: FileText },
  { label: 'Listings', tab: 'listings', icon: Users },
  { label: 'Verification', tab: 'verification', icon: Link2 },
] as const;

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'overview';

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-border bg-warning/10 px-4 py-2 text-center text-sm text-warning">
          <Badge variant="warning" className="mr-2">Preview</Badge>
          No authentication required - changes are not persisted.
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1 overflow-x-auto border-b border-border py-2">
          {ADMIN_NAV.map(({ label, tab, icon: Icon }) => {
            const isActive = currentTab === tab;
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
