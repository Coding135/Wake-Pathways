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

const PAID_LABELS: Record<string, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  stipend: 'Stipend',
  varies: 'Varies',
};

const CATEGORY_COLORS: Record<string, string> = {
  internship: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  volunteer: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10',
  scholarship: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
  summer_program: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/10',
  competition: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-700/10',
  leadership: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
  job: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10',
  mentorship: 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-700/10',
  other: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
}

type Opp = (typeof MOCK_OPPORTUNITIES)[number];

export function SavedAuthenticatedView({ initialSlugs }: { initialSlugs: string[] }) {
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/opportunities"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Saved Opportunities</h1>
        <p className="mt-2 text-muted-foreground">
          {slugs.length === 0
            ? 'Save opportunities while browsing to compare them later.'
            : `${slugs.length} saved opportunit${slugs.length === 1 ? 'y' : 'ies'}`}
        </p>
        {slugs.length >= 2 && (
          <Button
            variant={showCompare ? 'default' : 'outline'}
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => setShowCompare(!showCompare)}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {showCompare ? 'Hide comparison' : 'Compare saved'}
          </Button>
        )}
      </div>

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
                <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {category && (
                          <Badge className={cn('text-xs', getCategoryColor(opp.category))}>
                            {category.label}
                          </Badge>
                        )}
                        <Badge
                          className={cn('text-xs', getApplicationStatusColor(opp.application_status))}
                        >
                          {getStatusLabel(opp.application_status)}
                        </Badge>
                        {opp.verified && (
                          <Badge className="gap-1 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10 text-xs">
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

                    <SaveButton slug={opp.slug} />
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
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-28 px-4 py-3 text-left font-medium text-muted-foreground">Field</th>
                  {savedOpportunities.map((opp) => (
                    <th
                      key={opp.id}
                      className="min-w-44 px-4 py-3 text-left font-medium text-foreground"
                    >
                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="hover:text-primary hover:underline"
                      >
                        {opp.title.length > 40 ? opp.title.slice(0, 38) + '...' : opp.title}
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
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-muted-foreground">
                      {row.label}
                    </td>
                    {savedOpportunities.map((opp) => (
                      <td key={opp.id} className="px-4 py-2.5 text-foreground">
                        {row.render(opp)}
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
