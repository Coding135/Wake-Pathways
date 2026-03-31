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
    open: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    closing_soon: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    rolling: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
    closed: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20',
    unknown: 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20',
  };
  return colors[status];
}

export function getVerificationBadgeColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    needs_review: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    unverified: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
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
