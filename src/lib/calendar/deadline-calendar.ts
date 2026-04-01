import { addHours, isPast } from 'date-fns';
import type { ApplicationStatus, DeadlineType } from '@/types/database';

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
/** Stored “date only” deadlines often appear as midnight UTC. */
const MIDNIGHT_UTC_SUFFIX = /T00:00:00(?:\.0+)?Z$/i;

export type OpportunityDeadlineCalendarInput = {
  slug: string;
  title: string;
  deadline_type: DeadlineType;
  deadline_at: string | null;
  application_status: ApplicationStatus;
  organization: { name: string } | null;
  official_application_url: string | null;
  /** Canonical HTTPS URL for this opportunity detail page. */
  listingUrl: string;
};

export type DeadlineCalendarDraft = {
  eventTitle: string;
  description: string;
  allDay: boolean;
  /** YYYYMMDD inclusive start (all-day). */
  alldayStartYyyymmdd: string;
  /** YYYYMMDD exclusive end (all-day, ICS rule). */
  alldayEndExclusiveYyyymmdd: string;
  /** UTC ISO timestamps for timed block (1 hour, ending after deadline instant). */
  timedStartIsoUtc: string;
  timedEndIsoUtc: string;
  /** Stable UID segment for ICS. */
  uidKey: string;
};

function yyyymmddFromParts(y: number, m: number, d: number): string {
  return (
    String(y) +
    String(m).padStart(2, '0') +
    String(d).padStart(2, '0')
  );
}

function parseYmd(dateStr: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return { y, m: mo, d };
}

function addOneCalendarDayYmd(ymd: string): string | null {
  const p = parseYmd(ymd);
  if (!p) return null;
  const next = new Date(Date.UTC(p.y, p.m - 1, p.d + 1));
  return yyyymmddFromParts(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate()
  );
}

/** True if this deadline should be treated as an all-day event (no fabricated clock time). */
export function deadlineIsAllDayInterpretation(deadlineAtRaw: string): boolean {
  const t = deadlineAtRaw.trim();
  if (ISO_DATE_ONLY.test(t)) return true;
  const datePart = t.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  return MIDNIGHT_UTC_SUFFIX.test(t);
}

function endOfLocalDayAfterYmd(ymd: string): Date {
  const p = parseYmd(ymd);
  if (!p) throw new Error('Invalid YMD');
  return new Date(p.y, p.m - 1, p.d, 23, 59, 59, 999);
}

function isAllDayDeadlinePassed(ymd: string, now: Date): boolean {
  return now > endOfLocalDayAfterYmd(ymd);
}

function icsEscapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

function foldIcsLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, max));
  rest = rest.slice(max);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, max - 1));
    rest = rest.slice(max - 1);
  }
  return parts.join('\r\n');
}

function toGoogleUtcCompactUtcDate(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${mo}${day}T${h}${mi}${s}Z`;
}

function buildDescription(input: OpportunityDeadlineCalendarInput): string {
  const lines: string[] = [input.title.trim()];
  if (input.organization?.name?.trim()) {
    lines.push(`Organization: ${input.organization.name.trim()}`);
  }
  lines.push('');
  lines.push('Application deadline for this Wake Pathways opportunity.');
  lines.push('');
  if (input.official_application_url?.trim()) {
    lines.push(`Apply: ${input.official_application_url.trim()}`);
  }
  lines.push(`Listing: ${input.listingUrl.trim()}`);
  return lines.join('\n');
}

/**
 * Returns a calendar draft when the opportunity has a fixed, future, parseable deadline.
 * Rolling, none, invalid dates, vague storage, and past deadlines yield null.
 */
export function getOpportunityDeadlineCalendarDraft(
  input: OpportunityDeadlineCalendarInput,
  now: Date = new Date()
): DeadlineCalendarDraft | null {
  if (input.deadline_type !== 'fixed') return null;
  if (
    input.application_status === 'closed' ||
    input.application_status === 'unknown' ||
    input.application_status === 'rolling'
  ) {
    return null;
  }
  const raw = input.deadline_at?.trim();
  if (!raw) return null;

  const instant = new Date(raw);
  if (Number.isNaN(instant.getTime())) return null;

  const datePart = raw.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const allDay = deadlineIsAllDayInterpretation(raw);

  if (allDay) {
    if (!parseYmd(datePart)) return null;
    if (isAllDayDeadlinePassed(datePart, now)) return null;
    const endEx = addOneCalendarDayYmd(datePart);
    if (!endEx) return null;
    const draft: DeadlineCalendarDraft = {
      eventTitle: `${input.title.trim()}: Application deadline`,
      description: buildDescription(input),
      allDay: true,
      alldayStartYyyymmdd: datePart.replace(/-/g, ''),
      alldayEndExclusiveYyyymmdd: endEx,
      timedStartIsoUtc: '',
      timedEndIsoUtc: '',
      uidKey: `${input.slug}-d${datePart.replace(/-/g, '')}`,
    };
    return draft;
  }

  if (isPast(instant)) return null;

  const end = addHours(instant, 1);
  const draft: DeadlineCalendarDraft = {
    eventTitle: `${input.title.trim()}: Application deadline`,
    description: buildDescription(input),
    allDay: false,
    alldayStartYyyymmdd: '',
    alldayEndExclusiveYyyymmdd: '',
    timedStartIsoUtc: instant.toISOString(),
    timedEndIsoUtc: end.toISOString(),
    uidKey: `${input.slug}-t${instant.toISOString().replace(/[:.]/g, '-')}`,
  };
  return draft;
}

export type OpportunityDeadlineEligibilityInput = Pick<
  OpportunityDeadlineCalendarInput,
  'deadline_type' | 'deadline_at' | 'application_status'
>;

/**
 * True when the listing has a real, upcoming deadline that can be shown in calendar-style flows
 * (same rules as Add to calendar: fixed type, open-ish status, parseable, not passed).
 */
export function opportunityHasUsableFutureDeadline(
  input: OpportunityDeadlineEligibilityInput,
  now: Date = new Date()
): boolean {
  return (
    getOpportunityDeadlineCalendarDraft(
      {
        slug: '__eligible__',
        title: ' ',
        organization: null,
        official_application_url: null,
        listingUrl: 'https://example.com/__/',
        ...input,
      },
      now
    ) !== null
  );
}

export function buildGoogleCalendarUrl(draft: DeadlineCalendarDraft): string {
  const base = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({ action: 'TEMPLATE' });
  params.set('text', draft.eventTitle);
  params.set('details', draft.description);
  if (draft.allDay) {
    params.set('dates', `${draft.alldayStartYyyymmdd}/${draft.alldayEndExclusiveYyyymmdd}`);
  } else {
    const a = toGoogleUtcCompactUtcDate(new Date(draft.timedStartIsoUtc));
    const b = toGoogleUtcCompactUtcDate(new Date(draft.timedEndIsoUtc));
    params.set('dates', `${a}/${b}`);
  }
  return `${base}?${params.toString()}`;
}

export function buildIcsCalendarString(
  draft: DeadlineCalendarDraft,
  dtStampUtc: Date = new Date()
): string {
  const stamp = toGoogleUtcCompactUtcDate(dtStampUtc);
  const uid = `${draft.uidKey}@calendar.wakepathways.local`;
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wake Pathways//Opportunity Deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${icsEscapeText(draft.eventTitle)}`,
    foldIcsLine(`DESCRIPTION:${icsEscapeText(draft.description)}`),
  ];
  if (draft.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${draft.alldayStartYyyymmdd}`);
    lines.push(`DTEND;VALUE=DATE:${draft.alldayEndExclusiveYyyymmdd}`);
  } else {
    const ds = toGoogleUtcCompactUtcDate(new Date(draft.timedStartIsoUtc));
    const de = toGoogleUtcCompactUtcDate(new Date(draft.timedEndIsoUtc));
    lines.push(`DTSTART:${ds}`);
    lines.push(`DTEND:${de}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export function icsFilenameForSlug(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '') || 'opportunity';
  return `wake-pathways-${safe}-deadline.ics`;
}
