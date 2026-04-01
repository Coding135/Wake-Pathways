import { isClosingSoon } from '@/lib/utils';
import {
  opportunityHasUsableFutureDeadline,
  type OpportunityDeadlineEligibilityInput,
} from '@/lib/calendar/deadline-calendar';

/** Hide the same reminder again for one week after the user dismisses it. */
export const SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const SAVED_DEADLINE_REMINDER_STORAGE_KEY = 'wp_saved_closing_reminders_v1';

export function getSavedReminderStorageKey(userId: string): string {
  return `${SAVED_DEADLINE_REMINDER_STORAGE_KEY}:${userId}`;
}

export function reminderDismissStorageKey(slug: string, deadlineAt: string): string {
  return `${slug}::${deadlineAt}`;
}

export function parseReminderDismissals(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function pruneExpiredReminderDismissals(
  map: Record<string, number>,
  now: number = Date.now()
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, t] of Object.entries(map)) {
    if (now - t < SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS) out[k] = t;
  }
  return out;
}

export function isReminderDismissed(
  key: string,
  map: Record<string, number>,
  now: number = Date.now()
): boolean {
  const t = map[key];
  if (typeof t !== 'number') return false;
  return now - t < SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS;
}

export type SavedReminderOpportunity = OpportunityDeadlineEligibilityInput & {
  slug: string;
  deadline_at: string | null;
};

/**
 * Saved listings whose deadlines are real, still upcoming, in the app closing-soon window,
 * and not currently snoozed by dismissal state.
 */
export function getSavedClosingSoonReminders<T extends SavedReminderOpportunity>(
  saved: T[],
  dismissMap: Record<string, number>,
  now: Date = new Date()
): T[] {
  const t = now.getTime();
  return saved.filter((opp) => {
    if (!opportunityHasUsableFutureDeadline(opp, now)) return false;
    if (!opp.deadline_at || !isClosingSoon(opp.deadline_at)) return false;
    const key = reminderDismissStorageKey(opp.slug, opp.deadline_at);
    if (isReminderDismissed(key, dismissMap, t)) return false;
    return true;
  });
}
