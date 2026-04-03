'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

import { MOCK_OPPORTUNITIES, MOCK_ORGANIZATIONS } from '@/lib/mock-data';
import { OPPORTUNITY_CATEGORIES } from '@/lib/constants';
import {
  formatDeadline,
  getStatusLabel,
  getApplicationStatusColor,
  cn,
} from '@/lib/utils';
import { useSavedSlugs } from '@/hooks/use-saved-slugs';
import { SaveButton } from '@/components/opportunities/save-button';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OpportunityCategory } from '@/types/database';
import {
  CATEGORY_BADGE_CLASSES,
  VERIFIED_OPPORTUNITY_BADGE_CLASSES,
} from '@/lib/opportunity-badge-styles';
import { SavedClosingSoonReminders } from '@/components/saved/saved-closing-soon-reminders';

const PAID_LABELS: Record<string, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  stipend: 'Stipend',
  varies: 'Varies',
};

function getCategoryColor(cat: string): string {
  const c = cat as OpportunityCategory;
  return CATEGORY_BADGE_CLASSES[c] ?? CATEGORY_BADGE_CLASSES.other;
}

type Opp = (typeof MOCK_OPPORTUNITIES)[number];

export function SavedAuthenticatedView({
  initialSlugs,
  userId,
}: {
  initialSlugs: string[];
  userId: string;
}) {
  // Seeds React Query so SaveButton hearts match server data without waiting for /api/saved
  const { slugs } = useSavedSlugs(initialSlugs);
  const [showCompare, setShowCompare] = useState(false);

  const bySlug = useMemo(
    () => new Map(MOCK_OPPORTUNITIES.map((o) => [o.slug, o])),
    []
  );

  const savedOpportunities = useMemo(() => {
    return slugs.map((s) => bySlug.get(s)).filter((o): o is Opp => Boolean(o));
  }, [slugs, bySlug]);

  return (
    <div className="mx-auto min-w-0 max-w-4xl px-3 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <Link
          href="/opportunities"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
          Saved Opportunities
        </h1>
        <p className="mt-2 text-muted-foreground">
          {slugs.length === 0
            ? 'Save opportunities while browsing to compare them later.'
            : `${slugs.length} saved opportunit${slugs.length === 1 ? 'y' : 'ies'}`}
        </p>
        {slugs.length >= 2 && (
          <div className="mt-4 space-y-3">
            {!showCompare && (
              <div className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground dark:border-primary/30 dark:bg-primary/10">
                <p className="font-medium">Compare your shortlist</p>
                <p className="mt-1 text-muted-foreground">
                  Open a side-by-side table for deadlines, location, and pay at a glance.
                </p>
              </div>
            )}
            <Button
              variant={showCompare ? 'outline' : 'default'}
              size="default"
              className="gap-2 font-semibold shadow-sm"
              onClick={() => setShowCompare(!showCompare)}
            >
              <BarChart3 className="h-4 w-4" />
              {showCompare ? 'Hide comparison' : 'Compare saved'}
            </Button>
          </div>
        )}
      </div>

      {slugs.length > 0 && (
        <SavedClosingSoonReminders userId={userId} savedOpportunities={savedOpportunities} />
      )}

      {slugs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-border py-20 text-center"
        >
          <div className="rounded-full bg-muted p-4">
            <Heart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">No saved opportunities yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Tap the heart icon on any opportunity to save it here. You can compare saved listings side by
              side to find the best fit.
            </p>
          </div>
          <Link href="/opportunities" className={cn(buttonVariants({ size: 'lg' }), 'gap-1')}>
            Explore opportunities
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {savedOpportunities.map((opp, i) => {
            const category = OPPORTUNITY_CATEGORIES.find((c) => c.value === opp.category);
            const org = MOCK_ORGANIZATIONS.find((o) => o.id === opp.organization_id);

            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="rounded-xl border border-border bg-white p-4 shadow-[var(--elevated-card-shadow)] transition-shadow hover:shadow-md dark:bg-card dark:shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {category && (
                          <Badge variant="opportunity" className={getCategoryColor(opp.category)}>
                            {category.label}
                          </Badge>
                        )}
                        <Badge variant="opportunity" className={getApplicationStatusColor(opp.application_status)}>
                          {getStatusLabel(opp.application_status)}
                        </Badge>
                        {opp.verified && (
                          <Badge variant="opportunity" className={VERIFIED_OPPORTUNITY_BADGE_CLASSES}>
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="text-base font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                      >
                        {opp.title}
                      </Link>
                      {org && <p className="mt-0.5 text-sm text-muted-foreground">{org.name}</p>}

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {opp.location_city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {opp.location_city}
                          </span>
                        )}
                        {!(opp.application_status === 'closed' && !opp.deadline_at) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDeadline(opp.deadline_at, opp.deadline_type)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {PAID_LABELS[opp.paid_type]}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Link
                          href={`/opportunities/${opp.slug}`}
                          className={cn(
                            buttonVariants({
                              variant: 'outline',
                              size: 'sm',
                            }),
                            'gap-1 text-xs h-7'
                          )}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View details
                        </Link>
                      </div>
                    </div>

                    <SaveButton slug={opp.slug} className="self-end sm:self-start" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showCompare && savedOpportunities.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">Side-by-side comparison</h2>
          <div className="-mx-1 overflow-x-auto rounded-lg border border-border px-1 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[min(100%,32rem)] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="sticky left-0 z-10 min-w-[5.5rem] bg-muted/50 px-3 py-3 text-left text-xs font-medium text-muted-foreground sm:min-w-[7rem] sm:px-4 sm:text-sm">
                    Field
                  </th>
                  {savedOpportunities.map((opp) => (
                    <th
                      key={opp.id}
                      className="min-w-[11rem] max-w-[18rem] px-3 py-3 text-left align-bottom sm:min-w-[12rem] sm:px-4"
                    >
                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="line-clamp-4 text-pretty text-sm font-semibold leading-snug text-primary underline-offset-2 hover:underline"
                      >
                        {opp.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    label: 'Organization',
                    render: (o: Opp) => {
                      const orgMatch = MOCK_ORGANIZATIONS.find((org) => org.id === o.organization_id);
                      return orgMatch?.name || 'Unknown';
                    },
                  },
                  {
                    label: 'Category',
                    render: (o: Opp) => {
                      const cat = OPPORTUNITY_CATEGORIES.find((c) => c.value === o.category);
                      return cat?.label || o.category;
                    },
                  },
                  {
                    label: 'Status',
                    render: (o: Opp) => getStatusLabel(o.application_status),
                  },
                  {
                    label: 'Location',
                    render: (o: Opp) => o.location_city || 'Various',
                  },
                  {
                    label: 'Format',
                    render: (o: Opp) =>
                      o.remote_type === 'in_person'
                        ? 'In Person'
                        : o.remote_type === 'remote'
                          ? 'Remote'
                          : 'Hybrid',
                  },
                  {
                    label: 'Deadline',
                    render: (o: Opp) => formatDeadline(o.deadline_at, o.deadline_type),
                  },
                  {
                    label: 'Compensation',
                    render: (o: Opp) => o.compensation_text || PAID_LABELS[o.paid_type],
                  },
                  {
                    label: 'Cost',
                    render: (o: Opp) => (o.is_free ? 'Free' : o.cost_text || 'Unknown'),
                  },
                  {
                    label: 'Grades',
                    render: (o: Opp) => {
                      if (o.grades_min == null && o.grades_max == null) return 'All';
                      if (o.grades_min != null && o.grades_max != null)
                        return `${o.grades_min}th-${o.grades_max}th`;
                      if (o.grades_min != null) return `${o.grades_min}th+`;
                      return `Up to ${o.grades_max}th`;
                    },
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-background/95 px-3 py-2.5 text-xs font-medium text-muted-foreground backdrop-blur-sm sm:bg-background sm:px-4 sm:text-sm">
                      {row.label}
                    </td>
                    {savedOpportunities.map((opp) => (
                      <td
                        key={opp.id}
                        className="min-w-0 px-3 py-2.5 align-top text-foreground sm:px-4"
                      >
                        <span className="line-clamp-6 text-pretty sm:line-clamp-none">
                          {row.render(opp)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
