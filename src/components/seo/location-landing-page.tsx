import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { breadcrumbJsonLd, type LocationLandingConfig } from '@/lib/seo';
import type { OpportunityWithOrganization } from '@/types/database';

export function LocationLandingPage({
  config,
  listings,
}: {
  config: LocationLandingConfig;
  listings: OpportunityWithOrganization[];
}) {
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: config.city, path: config.path },
  ]);

  return (
    <div className="w-full bg-[var(--surface-explore)] dark:bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl md:text-4xl">
            {config.h1}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {config.intro}
          </p>
          <Link
            href="/opportunities"
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-5 gap-1')}
          >
            Browse all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          {listings.length === 0
            ? `No active listings in ${config.city} right now`
            : `${listings.length} ${listings.length === 1 ? 'opportunity' : 'opportunities'} in ${config.city}`}
        </p>

        {listings.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No active {config.city} listings matched right now. Browse all Wake County
              opportunities instead.
            </p>
            <Link
              href="/opportunities"
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
            >
              Browse all opportunities
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
