'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ChevronDown, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DeadlineCalendarDraft } from '@/lib/calendar/deadline-calendar';
import {
  buildGoogleCalendarUrl,
  buildIcsCalendarString,
  icsFilenameForSlug,
} from '@/lib/calendar/deadline-calendar';

type Props = {
  draft: DeadlineCalendarDraft;
  opportunitySlug: string;
};

export function AddDeadlineToCalendar({ draft, opportunitySlug }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function downloadIcs() {
    const body = buildIcsCalendarString(draft);
    const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = icsFilenameForSlug(opportunitySlug);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  const googleUrl = buildGoogleCalendarUrl(draft);

  return (
    <div ref={wrapRef} className="relative flex w-full sm:inline-flex sm:w-auto">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-1.5 border-border/80 bg-card shadow-sm hover:bg-muted/60 sm:w-auto touch-manipulation"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Add to calendar
        <ChevronDown
          className={cn('h-3.5 w-3.5 opacity-70 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </Button>
      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-30 mt-1.5 min-w-[min(100%,13.5rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card py-1 text-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 sm:left-0 sm:right-auto sm:max-w-none"
        >
          <a
            role="menuitem"
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 px-3 py-2 text-foreground hover:bg-muted/80"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            Google Calendar
          </a>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-muted/80"
            onClick={downloadIcs}
          >
            <Download className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            Apple, Outlook, or .ics file
          </button>
        </div>
      ) : null}
    </div>
  );
}
