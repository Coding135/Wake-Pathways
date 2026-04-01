import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  GraduationCap,
  Users,
  Globe,
  Building2,
  Tag,
  ShieldCheck,
  Briefcase,
  Heart,
  Sun,
  Trophy,
  Sparkles,
  MessageCircle,
  Layers,
} from 'lucide-react';
import { isPast } from 'date-fns';
import { getOpportunityBySlug, getOpportunities } from '@/lib/mock-data';
import { parseExploreReturnParam } from '@/lib/explore-search-params';
import { CATEGORY_MAP } from '@/lib/constants';
import type { OpportunityCategory } from '@/types/database';
import {
  cn,
  formatDate,
  formatDeadline,
  getAgeRangeLabel,
  getApplicationStatusColor,
  getGradeRangeLabel,
  getStatusLabel,
  isClosingSoon,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { OpportunityReviewsSection } from '@/components/opportunities/opportunity-reviews-section';
import { SaveButton } from '@/components/opportunities/save-button';
import { getOpportunityReviewsForDetail } from '@/lib/reviews/fetch-for-detail';
import { ShareButton } from './share-button';
import { ReportOpportunityIssueDialog } from '@/components/opportunities/report-opportunity-issue-dialog';
import { AddDeadlineToCalendar } from '@/components/opportunities/add-deadline-to-calendar';
import { getOpportunityDeadlineCalendarDraft } from '@/lib/calendar/deadline-calendar';
import { resolveAbsoluteListingUrl } from '@/lib/site-request-url';
import {
  CATEGORY_BADGE_CLASSES,
  VERIFIED_OPPORTUNITY_BADGE_CLASSES,
} from '@/lib/opportunity-badge-styles';

const CATEGORY_ICONS: Record<OpportunityCategory, React.ElementType> = {
  internship: Briefcase,
  volunteer: Heart,
  scholarship: GraduationCap,
  summer_program: Sun,
  competition: Trophy,
  leadership: Users,
  job: DollarSign,
  mentorship: MessageCircle,
  other: Sparkles,
};

const REMOTE_LABELS: Record<string, string> = {
  in_person: 'In Person',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

const PAID_LABELS: Record<string, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  stipend: 'Stipend',
  varies: 'Varies',
};

function firstSearchParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opp = getOpportunityBySlug(slug);
  if (!opp) return { title: 'Not Found - Wake Pathways' };
  return {
    title: `${opp.title} - Wake Pathways`,
    description: opp.short_summary ?? undefined,
  };
}

export default async function OpportunityDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const returnRaw = firstSearchParam(sp.return);
  const exploreContextQuery = parseExploreReturnParam(returnRaw);
  const backHref =
    exploreContextQuery !== null ? `/opportunities?${exploreContextQuery}` : '/opportunities';

  const opp = getOpportunityBySlug(slug);
  if (!opp) notFound();

  const CategoryIcon = CATEGORY_ICONS[opp.category];
  const categoryInfo = CATEGORY_MAP[opp.category];
  const closingSoon = isClosingSoon(opp.deadline_at);

  const scoreSimilarity = (o: typeof opp) => {
    let score = 0;
    if (o.category === opp.category) score += 5;
    if (opp.location_city && o.location_city === opp.location_city) score += 3;
    if (opp.age_min != null && o.age_min != null && Math.abs(o.age_min - opp.age_min) <= 2) score += 2;
    if (opp.paid_type === o.paid_type) score += 1;
    if (o.application_status !== 'closed') score += 2;
    return score;
  };
  const similar = getOpportunities({ per_page: 50 }).data
    .filter((o) => o.id !== opp.id)
    .sort((a, b) => scoreSimilarity(b) - scoreSimilarity(a))
    .slice(0, 3);

  const reviews = await getOpportunityReviewsForDetail(slug);

  const listingUrl = await resolveAbsoluteListingUrl(opp.slug);
  const deadlineCalendarDraft = getOpportunityDeadlineCalendarDraft({
    slug: opp.slug,
    title: opp.title,
    deadline_type: opp.deadline_type,
    deadline_at: opp.deadline_at,
    application_status: opp.application_status,
    organization: opp.organization,
    official_application_url: opp.official_application_url,
    listingUrl,
  });

  const details = [
    {
      icon: MapPin,
      label: 'Location',
      value: opp.location_city
        ? `${opp.location_city}, NC`
        : 'Various locations',
    },
    {
      icon: Globe,
      label: 'Format',
      value: REMOTE_LABELS[opp.remote_type],
    },
    {
      icon: Calendar,
      label: 'Deadline',
      value: formatDeadline(opp.deadline_at, opp.deadline_type),
      highlight: closingSoon,
    },
    {
      icon: DollarSign,
      label: 'Compensation',
      value: opp.compensation_text || PAID_LABELS[opp.paid_type],
    },
    ...(opp.category !== 'job' && (opp.cost_text || opp.is_free)
      ? [{
          icon: CreditCard,
          label: 'Cost',
          value: opp.is_free ? 'Free' : (opp.cost_text || 'Contact for details'),
        }]
      : []),
    {
      icon: GraduationCap,
      label: 'Grades',
      value: getGradeRangeLabel(opp.grades_min, opp.grades_max),
    },
    {
      icon: Users,
      label: 'Ages',
      value: getAgeRangeLabel(opp.age_min, opp.age_max),
    },
    ...(opp.time_commitment
      ? [{ icon: Clock, label: 'Time Commitment', value: opp.time_commitment }]
      : []),
    ...(opp.capacity_note
      ? [{ icon: Layers, label: 'Capacity', value: opp.capacity_note }]
      : []),
  ];

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to all opportunities
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="opportunity" className={CATEGORY_BADGE_CLASSES[opp.category]}>
            <CategoryIcon className="h-3 w-3" />
            {categoryInfo.label}
          </Badge>
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

        <h1 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {opp.title}
        </h1>

        {opp.organization && (
          <p className="mt-2 flex items-start gap-1.5 text-base text-muted-foreground sm:items-center sm:text-lg">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
            <span className="min-w-0 break-words">{opp.organization.name}</span>
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {opp.official_application_url && (
            <a
              href={opp.official_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'w-full justify-center gap-2 sm:w-auto touch-manipulation'
              )}
            >
              {opp.application_status === 'closed' ? 'View Official Page' : 'Apply on Official Site'}
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          )}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <ShareButton title={opp.title} />
            <SaveButton
              slug={opp.slug}
              size="sm"
              className="h-11 w-full justify-center sm:h-10 sm:w-10 sm:justify-center"
            />
          </div>
        </div>

        {/* Trust metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {opp.source_name && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Source: {opp.source_url ? (
                <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">{opp.source_name}</a>
              ) : opp.source_name}
            </span>
          )}
          {opp.last_verified_at && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified {formatDate(opp.last_verified_at)}
            </span>
          )}
        </div>
      </header>

      {/* Details grid */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="sr-only">Key Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <d.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {d.label}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-sm font-medium text-foreground',
                      'highlight' in d && d.highlight && 'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {deadlineCalendarDraft && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-snug text-muted-foreground sm:max-w-[min(100%,20rem)]">
                Add this deadline to your calendar so you remember to apply.
              </p>
              <AddDeadlineToCalendar
                draft={deadlineCalendarDraft}
                opportunitySlug={opp.slug}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {opp.full_description && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">About This Opportunity</h2>
          <div className="prose prose-sm max-w-none break-words text-muted-foreground leading-relaxed">
            {opp.full_description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {opp.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Skills you may build
          </h2>
          <div className="flex flex-wrap gap-2">
            {opp.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border/70 bg-muted/35 px-3 py-1 text-xs font-medium text-foreground/90"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Who is this for */}
      {(opp.grades_min != null || opp.grades_max != null ||
        opp.age_min != null || opp.age_max != null ||
        opp.location_city || opp.remote_type === 'remote' || opp.is_free) && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">At a glance</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(() => {
              const fitCues: Partial<Record<import('@/types/database').OpportunityCategory, string>> = {
                internship: 'Good for students looking for real-world work experience',
                volunteer: 'Good for teens interested in community service',
                scholarship: 'For students planning for college or career training',
                summer_program: 'Great for students looking for structured summer activities',
                competition: 'For students who enjoy academic or creative challenges',
                leadership: 'Good for students who want to develop leadership skills',
                job: 'For teens seeking paid work experience',
                mentorship: 'For students looking for guidance and professional connections',
              };
              const cue = fitCues[opp.category];
              return cue ? (
                <li className="flex items-start gap-2 font-medium text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {cue}
                </li>
              ) : null;
            })()}
            {opp.grades_min != null || opp.grades_max != null ? (
              <li className="flex items-start gap-2">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Students in {getGradeRangeLabel(opp.grades_min, opp.grades_max).toLowerCase()}
              </li>
            ) : null}
            {opp.age_min != null || opp.age_max != null ? (
              <li className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {getAgeRangeLabel(opp.age_min, opp.age_max)}
              </li>
            ) : null}
            {opp.location_city ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Located in {opp.location_city}, NC
              </li>
            ) : null}
            {opp.remote_type === 'remote' ? (
              <li className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Available remotely
              </li>
            ) : null}
            {opp.is_free && opp.category !== 'job' ? (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Free to participate
              </li>
            ) : null}
          </ul>
        </section>
      )}

      {/* Eligibility */}
      {opp.eligibility && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">Eligibility</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{opp.eligibility}</p>
        </section>
      )}

      {/* How to Apply */}
      {opp.official_application_url && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">How to Apply</h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>Visit the official application page to get started:</p>
            <a
              href={opp.official_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {opp.application_status === 'closed' ? `View on ${opp.source_name || 'Official Site'}` : `Apply on ${opp.source_name || 'Official Site'}`}
            </a>
            {opp.deadline_at && !isPast(new Date(opp.deadline_at)) && (
              <p className="text-xs text-muted-foreground/70">
                Application deadline: {formatDate(opp.deadline_at)}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tags */}
      {opp.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="sr-only">Tags</h2>
          <div className="flex flex-wrap gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {opp.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Source details */}
      {(opp.source_name || opp.source_url || opp.last_verified_at) && (
        <section className="mb-8 rounded-lg border border-border/60 bg-muted/30 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Source Details</h2>
          <dl className="space-y-2 text-sm">
            {opp.source_name && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="shrink-0 text-muted-foreground sm:w-24">Source</dt>
                <dd className="min-w-0 break-words text-foreground">{opp.source_name}</dd>
              </div>
            )}
            {opp.source_url && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="shrink-0 text-muted-foreground sm:w-24">Official page</dt>
                <dd className="min-w-0">
                  <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-primary underline transition-colors break-all hover:text-primary/80">
                    {opp.source_url}
                  </a>
                </dd>
              </div>
            )}
            {opp.last_verified_at && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="shrink-0 text-muted-foreground sm:w-24">Last verified</dt>
                <dd className="min-w-0 text-foreground">{formatDate(opp.last_verified_at)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="mb-8 rounded-lg border border-border/50 bg-muted/10 px-3 py-4 sm:px-4">
        <p className="mb-2 text-sm text-muted-foreground">
          Spot something outdated or incorrect? Help us keep Wake Pathways accurate.
        </p>
        <ReportOpportunityIssueDialog slug={slug} />
      </section>

      <OpportunityReviewsSection
        slug={slug}
        initialApproved={reviews.approved}
        initialMyReview={reviews.myReview}
        userId={reviews.userId}
        profileName={reviews.profileName}
        loadError={reviews.loadError}
      />

      {/* Similar opportunities */}
      {similar.length > 0 && (
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Similar Opportunities</h2>
            <Link
              href={`/opportunities?category=${opp.category}`}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'w-fit gap-1 self-start sm:self-auto touch-manipulation'
              )}
            >
              See all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <OpportunityCard
                key={s.id}
                opportunity={s}
                exploreContextQuery={exploreContextQuery ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
