import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getSavedClosingSoonReminders,
  isReminderDismissed,
  reminderDismissStorageKey,
  parseReminderDismissals,
  pruneExpiredReminderDismissals,
  SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS,
} from '@/lib/saved-deadline-reminders';

afterEach(() => {
  vi.useRealTimers();
});

const baseOpp = {
  id: '1',
  slug: 'youth-lead',
  title: 'Youth Program',
  deadline_type: 'fixed' as const,
  deadline_at: '2026-08-10T00:00:00Z',
  application_status: 'open' as const,
};

describe('getSavedClosingSoonReminders', () => {
  it('includes saved items with a usable deadline inside the closing-soon window', () => {
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'));
    const list = getSavedClosingSoonReminders([baseOpp], {});
    expect(list).toHaveLength(1);
    expect(list[0].slug).toBe('youth-lead');
  });

  it('excludes items outside the closing-soon window', () => {
    vi.setSystemTime(new Date('2026-07-01T12:00:00Z'));
    expect(getSavedClosingSoonReminders([baseOpp], {})).toHaveLength(0);
  });

  it('excludes rolling deadlines', () => {
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'));
    expect(
      getSavedClosingSoonReminders(
        [{ ...baseOpp, deadline_type: 'rolling', deadline_at: null }],
        {}
      )
    ).toHaveLength(0);
  });

  it('respects dismissal map within TTL', () => {
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'));
    const key = reminderDismissStorageKey(baseOpp.slug, baseOpp.deadline_at);
    const map = { [key]: Date.now() };
    expect(getSavedClosingSoonReminders([baseOpp], map)).toHaveLength(0);
  });
});

describe('parseReminderDismissals', () => {
  it('returns {} for invalid JSON', () => {
    expect(parseReminderDismissals('not json')).toEqual({});
  });
});

describe('pruneExpiredReminderDismissals', () => {
  it('drops entries older than TTL', () => {
    const now = Date.now();
    const old = now - SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS - 1000;
    const pruned = pruneExpiredReminderDismissals({ a: old, b: now - 1000 }, now);
    expect(pruned.a).toBeUndefined();
    expect(pruned.b).toBe(now - 1000);
  });
});

describe('isReminderDismissed', () => {
  it('returns false after TTL', () => {
    const now = Date.now();
    const old = now - SAVED_DEADLINE_REMINDER_DISMISS_TTL_MS - 1;
    expect(isReminderDismissed('k', { k: old }, now)).toBe(false);
  });
});
