import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CATEGORY_LANDINGS,
  breadcrumbJsonLd,
  type CategoryLandingConfig,
} from '@/lib/seo';
import type { OpportunityWithOrganization } from '@/types/database';

export function CategoryLandingPage({
  config,
  listings,
}: {
  config: CategoryLandingConfig;
  listings: OpportunityWithOrganization[];
}) {
  const otherCategories = CATEGORY_LANDINGS.filter((c) => c.slug !== config.slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: config.h1, path: config.path },
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
            {config.browseLinkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          {listings.length === 0
            ? 'No active listings right now'
            : `${listings.length} ${listings.length === 1 ? 'opportunity' : 'opportunities'} found`}
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
              No active listings in this category yet. Check Explore for more Wake County
              opportunities.
            </p>
            <Link
              href="/opportunities"
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
            >
              Browse all opportunities
            </Link>
          </div>
        )}

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="category-faq">
          <h2 id="category-faq" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6">
            {config.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-sm font-semibold text-foreground sm:text-base">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="explore-more">
          <h2 id="explore-more" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Explore More
          </h2>
          <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            {otherCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={cat.path}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {cat.exploreMoreLabel}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to Browse all opportunities
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
