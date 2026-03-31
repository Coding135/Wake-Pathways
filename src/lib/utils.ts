import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns';
import type { ApplicationStatus, DeadlineType, VerificationStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDeadline(
  deadline: string | null,
  deadlineType: DeadlineType
): string {
  if (deadlineType === 'rolling') return 'Rolling';
  if (deadlineType === 'none' || !deadline) return 'None';

  const d = new Date(deadline);
  if (isPast(d)) return format(d, 'MMM d') + ' (passed)';
  return format(d, 'MMM d');
}

export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    open: 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/25 dark:bg-green-950/45 dark:text-green-200 dark:ring-green-400/35',
    closing_soon:
      'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25 dark:bg-amber-950/45 dark:text-amber-200 dark:ring-amber-400/35',
    rolling:
      'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/25 dark:bg-blue-950/45 dark:text-blue-200 dark:ring-blue-400/35',
    closed:
      'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-500/20 dark:bg-stone-800/90 dark:text-stone-300 dark:ring-stone-500/30',
    unknown:
      'bg-stone-100 text-stone-500 ring-1 ring-inset ring-stone-400/25 dark:bg-stone-800/70 dark:text-stone-400 dark:ring-stone-500/25',
  };
  return colors[status];
}

export function getVerificationBadgeColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    verified:
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-1 dark:ring-inset dark:ring-emerald-400/25',
    pending:
      'bg-yellow-100 text-yellow-900 dark:bg-yellow-950/45 dark:text-yellow-200 dark:ring-1 dark:ring-inset dark:ring-yellow-400/25',
    needs_review:
      'bg-orange-100 text-orange-900 dark:bg-orange-950/45 dark:text-orange-200 dark:ring-1 dark:ring-inset dark:ring-orange-400/25',
    failed:
      'bg-red-100 text-red-900 dark:bg-red-950/45 dark:text-red-200 dark:ring-1 dark:ring-inset dark:ring-red-400/25',
    unverified:
      'bg-stone-100 text-stone-600 dark:bg-stone-800/80 dark:text-stone-400 dark:ring-1 dark:ring-inset dark:ring-stone-500/20',
  };
  return colors[status];
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  open: 'Open',
  closing_soon: 'Closing Soon',
  rolling: 'Rolling',
  closed: 'Closed',
  unknown: 'Unknown',
};

export function getStatusLabel(status: ApplicationStatus): string {
  return STATUS_LABELS[status] || 'Unknown';
}

export function resolveDisplayStatus(opp: {
  application_status: ApplicationStatus;
  deadline_type: string;
  deadline_at: string | null;
}): ApplicationStatus {
  if (opp.application_status === 'closed') return 'closed';
  if (opp.application_status === 'unknown') return 'unknown';

  if (opp.deadline_type === 'rolling' || opp.application_status === 'rolling') {
    return 'rolling';
  }

  if (opp.deadline_at) {
    const d = new Date(opp.deadline_at);
    if (isPast(d)) return 'closed';
    if (differenceInDays(d, new Date()) <= 7) return 'closing_soon';
  }

  return opp.application_status;
}

export const STATUS_ICONS = {
  open: 'circle-check',
  closing_soon: 'clock',
  rolling: 'refresh-cw',
  closed: 'x-circle',
  unknown: 'help-circle',
} as const;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

export function isClosingSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isPast(d)) return false;
  return differenceInDays(d, new Date()) <= 7;
}

export function getGradeRangeLabel(
  min: number | null,
  max: number | null
): string {
  if (min == null && max == null) return 'All grades';
  if (min != null && max != null) {
    if (min === max) return `${ordinalGrade(min)} grade`;
    return `${ordinalGrade(min)} – ${ordinalGrade(max)} grade`;
  }
  if (min != null) return `${ordinalGrade(min)}+ grade`;
  return `Up to ${ordinalGrade(max!)} grade`;
}

export function getAgeRangeLabel(
  min: number | null,
  max: number | null
): string {
  if (min == null && max == null) return 'All ages';
  if (min != null && max != null) {
    if (min === max) return `${min} years old`;
    return `${min}–${max} years old`;
  }
  if (min != null) return `${min}+ years old`;
  return `Up to ${max} years old`;
}

export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isPast(d)) return 0;
  return differenceInDays(d, new Date());
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

function ordinalGrade(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || 'th'}`;
}
