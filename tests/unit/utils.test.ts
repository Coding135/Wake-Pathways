import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatDate,
  formatDeadline,
  isClosingSoon,
  getGradeRangeLabel,
  getAgeRangeLabel,
  slugify,
  truncate,
  getDaysUntilDeadline,
  cn,
} from '@/lib/utils';

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDate', () => {
  it('returns correct format for an ISO string', () => {
    expect(formatDate('2026-04-15T23:59:00Z')).toBe('Apr 15, 2026');
  });

  it('returns correct format for a Date object', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('Jan 1, 2026');
  });
});

describe('formatDeadline', () => {
  it('returns a month and day for fixed deadlines in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = formatDeadline(futureDate.toISOString(), 'fixed');
    expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}$/);
  });

  it('returns Rolling for rolling deadlines', () => {
    expect(formatDeadline(null, 'rolling')).toBe('Rolling');
  });

  it('returns a clear label for none type', () => {
    expect(formatDeadline(null, 'none')).toBe('No fixed deadline');
  });

  it('marks past fixed deadlines with (passed)', () => {
    expect(formatDeadline('2020-01-01T00:00:00Z', 'fixed')).toMatch(/\(passed\)$/);
  });
});

describe('isClosingSoon', () => {
  it('returns true for deadlines within 7 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    expect(isClosingSoon(soon.toISOString())).toBe(true);
  });

  it('returns false for deadlines far away', () => {
    const farAway = new Date();
    farAway.setDate(farAway.getDate() + 30);
    expect(isClosingSoon(farAway.toISOString())).toBe(false);
  });

  it('returns false for null deadline', () => {
    expect(isClosingSoon(null)).toBe(false);
  });

  it('returns false for past deadlines', () => {
    expect(isClosingSoon('2020-01-01T00:00:00Z')).toBe(false);
  });
});

describe('getGradeRangeLabel', () => {
  it('returns "All grades" when both are null', () => {
    expect(getGradeRangeLabel(null, null)).toBe('All grades');
  });

  it('returns range label for min and max', () => {
    expect(getGradeRangeLabel(9, 12)).toBe('9th – 12th grade');
  });

  it('returns single grade label when min equals max', () => {
    expect(getGradeRangeLabel(10, 10)).toBe('10th grade');
  });

  it('returns min+ label when only min is provided', () => {
    expect(getGradeRangeLabel(9, null)).toBe('9th+ grade');
  });

  it('returns "Up to" label when only max is provided', () => {
    expect(getGradeRangeLabel(null, 12)).toBe('Up to 12th grade');
  });
});

describe('getAgeRangeLabel', () => {
  it('returns "All ages" when both are null', () => {
    expect(getAgeRangeLabel(null, null)).toBe('All ages');
  });

  it('returns range label for min and max', () => {
    expect(getAgeRangeLabel(14, 18)).toBe('14–18 years old');
  });

  it('returns single age label when min equals max', () => {
    expect(getAgeRangeLabel(16, 16)).toBe('16 years old');
  });

  it('returns min+ label when only min is provided', () => {
    expect(getAgeRangeLabel(14, null)).toBe('14+ years old');
  });

  it('returns "Up to" label when only max is provided', () => {
    expect(getAgeRangeLabel(null, 18)).toBe('Up to 18 years old');
  });
});

describe('slugify', () => {
  it('creates proper slug from normal text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('NC State Summer Science & Engineering Camp')).toBe(
      'nc-state-summer-science-engineering-camp'
    );
  });

  it('trims and collapses whitespace/dashes', () => {
    expect(slugify('  too   many   spaces  ')).toBe('too-many-spaces');
  });

  it('removes leading/trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello');
  });
});

describe('truncate', () => {
  it('truncates at correct length with ellipsis', () => {
    const long = 'This is a very long string that should be truncated';
    const result = truncate(long, 20);
    expect(result.length).toBeLessThanOrEqual(21); // 20 chars + ellipsis character
    expect(result).toContain('…');
  });

  it('returns full string if shorter than limit', () => {
    expect(truncate('Short', 100)).toBe('Short');
  });

  it('returns full string if exactly at limit', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });
});

describe('getDaysUntilDeadline', () => {
  it('returns correct positive count for future deadline', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const days = getDaysUntilDeadline(future.toISOString());
    expect(days).toBeGreaterThanOrEqual(9);
    expect(days).toBeLessThanOrEqual(10);
  });

  it('returns 0 for past deadline', () => {
    expect(getDaysUntilDeadline('2020-01-01T00:00:00Z')).toBe(0);
  });

  it('returns null for null deadline', () => {
    expect(getDaysUntilDeadline(null)).toBeNull();
  });
});

describe('cn', () => {
  it('merges classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('px-4');
    expect(result).toContain('py-1');
    expect(result).not.toContain('px-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});
