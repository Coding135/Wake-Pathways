'use client';

import Link from 'next/link';
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Heart,
  GraduationCap,
  Sun,
  Trophy,
  Users,
  Sparkles,
  MessageCircle,
  Microscope,
  Globe,
} from 'lucide-react';
import type { OpportunityWithOrganization, OpportunityCategory } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { cn, truncate, formatDeadline, getStatusLabel, getApplicationStatusColor } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/constants';
import { CATEGORY_BADGE_CLASSES } from '@/lib/opportunity-badge-styles';
import { SaveButton } from './save-button';

const CATEGORY_ICONS: Record<OpportunityCategory, React.ElementType> = {
  internship: Briefcase,
  volunteer: Heart,
  scholarship: GraduationCap,
  summer_program: Sun,
  research: Microscope,
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
        'group relative flex min-w-0 flex-col rounded-xl border border-border bg-white shadow-[var(--elevated-card-shadow)]',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        'dark:border-border dark:bg-card dark:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
        className
      )}
    >
      <div className="flex flex-col gap-3 p-4 pb-0 sm:gap-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2">
            <Badge variant="opportunity" className={CATEGORY_BADGE_CLASSES[opportunity.category]}>
              <CategoryIcon className="size-3 shrink-0" />
              {categoryInfo.label}
            </Badge>
            <Badge variant="opportunity" className={getApplicationStatusColor(opportunity.application_status)}>
              {getStatusLabel(opportunity.application_status)}
            </Badge>
          </div>
          <SaveButton
            slug={opportunity.slug}
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          />
        </div>

        <div className="min-h-0 flex-1">
          <h3 className="min-w-0 text-base font-semibold leading-snug text-foreground transition-colors duration-150 group-hover:text-primary">
            {truncate(opportunity.title, 72)}
          </h3>
          {opportunity.organization && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {opportunity.organization.name}
            </p>
          )}
          {opportunity.short_summary && (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {truncate(opportunity.short_summary, 140)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center border-t border-border/50 px-4 py-3 sm:px-5">
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
