import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  deadlineIsAllDayInterpretation,
  getOpportunityDeadlineCalendarDraft,
  buildGoogleCalendarUrl,
  buildIcsCalendarString,
  icsFilenameForSlug,
  type OpportunityDeadlineCalendarInput,
} from '@/lib/calendar/deadline-calendar';

afterEach(() => {
  vi.useRealTimers();
});

const baseInput = (over: Partial<OpportunityDeadlineCalendarInput> = {}): OpportunityDeadlineCalendarInput => ({
  slug: 'test-opp',
  title: 'Youth Leadership Program',
  deadline_type: 'fixed',
  deadline_at: '2026-08-15T00:00:00Z',
  application_status: 'open',
  organization: { name: 'Wake Nonprofit' },
  official_application_url: 'https://example.com/apply',
  listingUrl: 'https://wakepathways.test/opportunities/test-opp',
  ...over,
});

describe('deadlineIsAllDayInterpretation', () => {
  it('is true for date-only strings', () => {
    expect(deadlineIsAllDayInterpretation('2026-04-01')).toBe(true);
  });

  it('is true for midnight UTC timestamps', () => {
    expect(deadlineIsAllDayInterpretation('2026-04-01T00:00:00Z')).toBe(true);
    expect(deadlineIsAllDayInterpretation('2026-04-01T00:00:00.000Z')).toBe(true);
  });

  it('is false when a specific clock time is set', () => {
    expect(deadlineIsAllDayInterpretation('2026-04-01T23:59:59Z')).toBe(false);
    expect(deadlineIsAllDayInterpretation('2026-04-01T15:30:00Z')).toBe(false);
  });
});

describe('getOpportunityDeadlineCalendarDraft', () => {
  it('returns null for rolling deadlines', () => {
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ deadline_type: 'rolling' }))).toBeNull();
  });

  it('returns null for none deadlines', () => {
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ deadline_type: 'none', deadline_at: null }))).toBeNull();
  });

  it('returns null when application status is unknown, rolling, or closed', () => {
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ application_status: 'unknown' }))).toBeNull();
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ application_status: 'rolling' }))).toBeNull();
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ application_status: 'closed' }))).toBeNull();
  });

  it('returns null when deadline_at is missing', () => {
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ deadline_at: null }))).toBeNull();
  });

  it('returns null for unparseable deadlines', () => {
    expect(getOpportunityDeadlineCalendarDraft(baseInput({ deadline_at: 'not-a-date' }))).toBeNull();
  });

  it('returns an all-day draft for midnight UTC and a future deadline', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const d = getOpportunityDeadlineCalendarDraft(baseInput());
    expect(d).not.toBeNull();
    expect(d!.allDay).toBe(true);
    expect(d!.alldayStartYyyymmdd).toBe('20260815');
    expect(d!.eventTitle).toContain('Application deadline');
  });

  it('returns null when an all-day deadline has already ended locally', () => {
    vi.setSystemTime(new Date('2026-08-16T12:00:00Z'));
    expect(getOpportunityDeadlineCalendarDraft(baseInput())).toBeNull();
  });

  it('returns a timed draft when a non-midnight instant is used', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const d = getOpportunityDeadlineCalendarDraft(
      baseInput({ deadline_at: '2026-08-15T23:59:59Z' })
    );
    expect(d).not.toBeNull();
    expect(d!.allDay).toBe(false);
    expect(d!.timedStartIsoUtc).toBe('2026-08-15T23:59:59.000Z');
  });

  it('returns null for timed deadlines in the past', () => {
    vi.setSystemTime(new Date('2026-12-01T12:00:00Z'));
    expect(
      getOpportunityDeadlineCalendarDraft(baseInput({ deadline_at: '2026-08-15T23:59:59Z' }))
    ).toBeNull();
  });

  it('includes listing and apply lines in the description', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const d = getOpportunityDeadlineCalendarDraft(baseInput());
    expect(d!.description).toContain('Youth Leadership Program');
    expect(d!.description).toContain('Organization: Wake Nonprofit');
    expect(d!.description).toContain('Apply: https://example.com/apply');
    expect(d!.description).toContain('Listing: https://wakepathways.test/opportunities/test-opp');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('includes all-day dates in Google format', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const d = getOpportunityDeadlineCalendarDraft(baseInput())!;
    const url = buildGoogleCalendarUrl(d);
    expect(url).toContain('calendar.google.com');
    expect(url).toContain('dates=20260815%2F20260816');
  });
});

describe('buildIcsCalendarString', () => {
  it('emits an all-day VEVENT', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const d = getOpportunityDeadlineCalendarDraft(baseInput())!;
    const ics = buildIcsCalendarString(d, new Date('2026-05-01T00:00:00Z'));
    expect(ics).toContain('DTSTART;VALUE=DATE:20260815');
    expect(ics).toContain('DTEND;VALUE=DATE:20260816');
    expect(ics).toContain('BEGIN:VCALENDAR');
  });
});

describe('icsFilenameForSlug', () => {
  it('prefixes the filename and keeps slug safe', () => {
    expect(icsFilenameForSlug('my-program')).toBe('wake-pathways-my-program-deadline.ics');
  });
});
