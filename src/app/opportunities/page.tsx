import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Search } from 'lucide-react';
import { getOpportunities } from '@/lib/mock-data';
import { serializeExploreParams } from '@/lib/explore-search-params';
import type { OpportunityCategory, RemoteType, PaidType, ApplicationStatus } from '@/types/database';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { OpportunityFilters } from '@/components/opportunities/opportunity-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Explore Opportunities - Wake Pathways',
  description:
    'Wake County-first internships, volunteering, and leadership, plus Triangle and NC options. Scholarships include local, statewide, and a small curated set of national awards.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const gradeRaw = first(sp.grade);
  const grade = gradeRaw ? Number(gradeRaw) : undefined;
  const pageRaw = first(sp.page);
  const page = pageRaw ? Math.max(1, Number(pageRaw)) : 1;

  const result = getOpportunities({
    search: first(sp.search),
    category: first(sp.category) as OpportunityCategory | undefined,
    city: first(sp.city),
    remote_type: first(sp.remote_type) as RemoteType | undefined,
    paid_type: first(sp.paid_type) as PaidType | undefined,
    application_status: first(sp.application_status) as ApplicationStatus | undefined,
    grade: Number.isFinite(grade) ? grade : undefined,
    verified_only: first(sp.verified_only) === 'true',
    is_free: first(sp.is_free) === 'true',
    interests: first(sp.interests),
    sort: first(sp.sort),
    page,
    per_page: 12,
  });

  const exploreContextQuery = serializeExploreParams(sp);

  return (
    <div className="w-full bg-[var(--surface-explore)] dark:bg-background">
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl md:text-4xl">
          Explore Opportunities
        </h1>
        <p className="mt-2 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Explore internships, volunteer opportunities, scholarships, summer programs, research
          experiences, leadership roles, jobs, and more for Wake County teens. Use this page to browse
          real opportunities, filter by what fits you best, and quickly find options that match your
          interests, goals, and schedule.
        </p>
      </div>

      <Suspense fallback={<FilterSkeleton />}>
        <OpportunityFilters />
      </Suspense>

      <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-sm text-muted-foreground">
          {result.total === 0
            ? 'No opportunities found'
            : `${result.total} ${result.total === 1 ? 'opportunity' : 'opportunities'} found`}
        </p>
        {result.total_pages > 1 && (
          <p className="text-sm text-muted-foreground tabular-nums sm:text-right">
            Page {result.page} of {result.total_pages}
          </p>
        )}
      </div>

      {result.data.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              exploreContextQuery={exploreContextQuery || undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {result.total_pages > 1 && (
        <Pagination
          currentPage={result.page}
          totalPages={result.total_pages}
          searchParams={sp}
        />
      )}
    </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No opportunities match your filters
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try broadening your search, removing some filters, or checking back later for new listings.
      </p>
      <Link href="/opportunities" className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}>
        Clear all filters
      </Link>
    </div>
  );
}

function buildPageHref(
  page: number,
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams(serializeExploreParams(searchParams));
  if (page > 1) params.set('page', String(page));
  else params.delete('page');
  const qs = params.toString();
  return `/opportunities${qs ? `?${qs}` : ''}`;
}

/** Compact page list with ellipses for many pages (desktop). */
function visiblePageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pageHref = (page: number) => buildPageHref(page, searchParams);
  const desktopPages = visiblePageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 md:items-center"
      aria-label="Pagination"
    >
      <div className="flex items-center justify-between gap-3 md:hidden">
        <Link
          href={pageHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'min-h-10 min-w-[5.5rem] touch-manipulation',
            currentPage <= 1 && 'pointer-events-none opacity-50'
          )}
        >
          Previous
        </Link>
        <p className="text-center text-sm font-medium text-muted-foreground tabular-nums">
          Page {currentPage} of {totalPages}
        </p>
        <Link
          href={pageHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'min-h-10 min-w-[5.5rem] touch-manipulation',
            currentPage >= totalPages && 'pointer-events-none opacity-50'
          )}
        >
          Next
        </Link>
      </div>

      <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
        <Link
          href={pageHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            currentPage <= 1 && 'pointer-events-none opacity-50'
          )}
        >
          Previous
        </Link>

        {desktopPages.map((item, i) =>
          item === '…' ? (
            <span
              key={`e-${i}`}
              className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item)}
              className={cn(
                buttonVariants({ variant: item === currentPage ? 'default' : 'outline', size: 'sm' }),
                'min-h-9 min-w-9 touch-manipulation'
              )}
            >
              {item}
            </Link>
          )
        )}

        <Link
          href={pageHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            currentPage >= totalPages && 'pointer-events-none opacity-50'
          )}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  );
}
