'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDate, getDaysUntilDeadline } from '@/lib/utils';
import {
  getSavedClosingSoonReminders,
  reminderDismissStorageKey,
  pruneExpiredReminderDismissals,
  parseReminderDismissals,
  getSavedReminderStorageKey,
  type SavedReminderOpportunity,
} from '@/lib/saved-deadline-reminders';

type Opp = SavedReminderOpportunity & {
  id: string;
  title: string;
};

type Props = {
  userId: string;
  savedOpportunities: Opp[];
};

export function SavedClosingSoonReminders({ userId, savedOpportunities }: Props) {
  const [dismissMap, setDismissMap] = useState<Record<string, number> | null>(null);
  const storageKey = getSavedReminderStorageKey(userId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = pruneExpiredReminderDismissals(parseReminderDismissals(raw));
      setDismissMap(parsed);
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    } catch {
      setDismissMap({});
    }
  }, [storageKey]);

  const reminders = useMemo(() => {
    if (dismissMap === null) return [];
    return getSavedClosingSoonReminders(savedOpportunities, dismissMap);
  }, [savedOpportunities, dismissMap]);

  const dismiss = useCallback((slug: string, deadlineAt: string) => {
    const key = reminderDismissStorageKey(slug, deadlineAt);
    setDismissMap((prev) => {
      const base = prev ?? {};
      const next = pruneExpiredReminderDismissals({ ...base, [key]: Date.now() });
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  }, [storageKey]);

  if (dismissMap === null || reminders.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-8 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/[0.07]"
      aria-labelledby="saved-closing-soon-heading"
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
          aria-hidden
        >
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="saved-closing-soon-heading"
            className="text-sm font-semibold text-foreground"
          >
            Closing soon
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            You saved these opportunities and the application deadline is coming up. A gentle nudge so
            nothing slips by.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {reminders.map((opp) => {
          const days = getDaysUntilDeadline(opp.deadline_at);
          const daysLabel =
            days === 0
              ? 'Deadline is today'
              : days === 1
                ? '1 day left'
                : days != null
                  ? `${days} days left`
                  : null;

          return (
            <li
              key={`${opp.slug}-${opp.deadline_at}`}
              className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-card/50"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/opportunities/${opp.slug}`}
                  className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
                >
                  {opp.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Apply by {opp.deadline_at ? formatDate(opp.deadline_at) : ''}
                  {daysLabel ? ` · ${daysLabel}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/opportunities/${opp.slug}`}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted dark:bg-card'
                  )}
                >
                  View
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => opp.deadline_at && dismiss(opp.slug, opp.deadline_at)}
                  aria-label={`Dismiss reminder for ${opp.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                  Dismiss
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] leading-snug text-muted-foreground/90">
        Dismissed reminders stay hidden for about a week for that listing, or if the deadline
        changes.
      </p>
    </section>
  );
}
