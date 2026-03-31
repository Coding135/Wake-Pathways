'use client';

import Link from 'next/link';
import {
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Briefcase,
  Heart,
  GraduationCap,
  Sun,
  Trophy,
  Users,
  Sparkles,
  MessageCircle,
  Globe,
} from 'lucide-react';
import type { OpportunityWithOrganization, OpportunityCategory } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { cn, truncate, formatDeadline, getStatusLabel, getApplicationStatusColor } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/constants';
import {
  CATEGORY_BADGE_CLASSES,
  VERIFIED_OPPORTUNITY_BADGE_CLASSES,
} from '@/lib/opportunity-badge-styles';
import { SaveButton } from './save-button';

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

const PAID_LABELS: Record<string, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  stipend: 'Stipend',
  varies: 'Varies',
};

interface OpportunityCardProps {
  opportunity: OpportunityWithOrganization;
  className?: string;
  /**
   * When set, detail URL includes `?return=…` so Back links and navigation can
   * restore this /opportunities query string (whitelisted keys only).
   */
  exploreContextQuery?: string;
}

export function OpportunityCard({
  opportunity,
  className,
  exploreContextQuery,
}: OpportunityCardProps) {
  const CategoryIcon = CATEGORY_ICONS[opportunity.category];
  const categoryInfo = CATEGORY_MAP[opportunity.category];

  const href =
    exploreContextQuery && exploreContextQuery.length > 0
      ? `/opportunities/${opportunity.slug}?return=${encodeURIComponent(exploreContextQuery)}`
      : `/opportunities/${opportunity.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-white shadow-[0_1px_3px_rgba(28,25,23,0.06)]',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        'dark:border-border dark:bg-card dark:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
        className
      )}
    >
      <div className="flex flex-col gap-3 p-5 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge className={cn('gap-1', CATEGORY_BADGE_CLASSES[opportunity.category])}>
              <CategoryIcon className="h-3 w-3" />
              {categoryInfo.label}
            </Badge>
            <Badge className={cn('gap-1', getApplicationStatusColor(opportunity.application_status))}>
              {getStatusLabel(opportunity.application_status)}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {opportunity.verified && (
              <Badge className={cn('gap-1', VERIFIED_OPPORTUNITY_BADGE_CLASSES)}>
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <SaveButton slug={opportunity.slug} className="h-7 w-7 -mr-1" />
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-150">
            {truncate(opportunity.title, 72)}
          </h3>
          {opportunity.organization && (
            <p className="mt-1 text-sm text-muted-foreground">
              {opportunity.organization.name}
            </p>
          )}
          {opportunity.short_summary && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {truncate(opportunity.short_summary, 140)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center border-t border-border/50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {opportunity.location_city || 'Various'}
            {opportunity.remote_type === 'remote' && (
              <Globe className="h-3 w-3 ml-0.5" />
            )}
          </span>
          {!(opportunity.application_status === 'closed' && !opportunity.deadline_at) && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatDeadline(opportunity.deadline_at, opportunity.deadline_type)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3 w-3 shrink-0" />
            {PAID_LABELS[opportunity.paid_type]}
          </span>
        </div>
      </div>
    </Link>
  );
}
