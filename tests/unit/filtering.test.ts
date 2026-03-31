import { describe, it, expect } from 'vitest';
import {
  getOpportunities,
  MOCK_OPPORTUNITIES,
} from '@/lib/mock-data';

const activeCount = MOCK_OPPORTUNITIES.filter((o) => o.is_active).length;

describe('getOpportunities', () => {
  it('returns all active opportunities with no filters', () => {
    const result = getOpportunities();
    expect(result.total).toBe(activeCount);
    expect(result.data.length).toBeLessThanOrEqual(result.per_page);
    result.data.forEach((opp) => {
      expect(opp.is_active).toBe(true);
    });
  });

  it('filters by search matching title', () => {
    const result = getOpportunities({ search: 'Raleigh Youth Employment' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.data.some((o) => o.slug === 'raleigh-youth-employment-summer-2026')).toBe(true);
  });

  it('filters by search matching summary', () => {
    const result = getOpportunities({ search: 'Sort and pack food' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.data.some((o) => o.slug === 'food-bank-teen-volunteer')).toBe(true);
  });

  it('filters by category', () => {
    const result = getOpportunities({ category: 'volunteer' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.category).toBe('volunteer');
    });
  });

  it('filters by city', () => {
    const result = getOpportunities({ city: 'Apex' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.location_city?.toLowerCase()).toBe('apex');
    });
  });

  it('filters by grade', () => {
    const result = getOpportunities({ grade: 7 });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      if (opp.grades_min != null) expect(7).toBeGreaterThanOrEqual(opp.grades_min);
      if (opp.grades_max != null) expect(7).toBeLessThanOrEqual(opp.grades_max);
    });
    // opp-004 (Duke TIP) has grades 7-10 so it should be included
    expect(result.data.some((o) => o.slug === 'duke-tip-summer-studies')).toBe(true);
    // opp-002 (WCPSS Tutor) has grades 10-12 so it should be excluded
    expect(result.data.some((o) => o.slug === 'wcpss-volunteer-tutor-program')).toBe(false);
  });

  it('filters by age', () => {
    const result = getOpportunities({ age: 12 });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      if (opp.age_min != null) expect(12).toBeGreaterThanOrEqual(opp.age_min);
      if (opp.age_max != null) expect(12).toBeLessThanOrEqual(opp.age_max);
    });
    // opp-004 (Duke TIP) has age 12-16 so it should be included
    expect(result.data.some((o) => o.slug === 'duke-tip-summer-studies')).toBe(true);
    // opp-001 (Raleigh Youth) has age 14-21 so it should be excluded
    expect(result.data.some((o) => o.slug === 'raleigh-youth-employment-summer-2026')).toBe(false);
  });

  it('filters by paid_type', () => {
    const result = getOpportunities({ paid_type: 'paid' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.paid_type).toBe('paid');
    });
  });

  it('filters by remote_type', () => {
    const result = getOpportunities({ remote_type: 'hybrid' });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.remote_type).toBe('hybrid');
    });
  });

  it('filters by verified_only', () => {
    const result = getOpportunities({ verified_only: true });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.verified).toBe(true);
    });
    // opp-011 (Library TAB) is unverified, should be excluded
    expect(result.data.some((o) => o.slug === 'wake-county-library-teen-advisory')).toBe(false);
  });

  it('filters by is_free', () => {
    const result = getOpportunities({ is_free: true });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.is_free).toBe(true);
    });
    // opp-003 (NC State Science Camp) is not free, should be excluded
    expect(result.data.some((o) => o.slug === 'nc-state-summer-science-camp')).toBe(false);
  });

  it('combines multiple filters', () => {
    const result = getOpportunities({
      category: 'volunteer',
      city: 'Raleigh',
      is_free: true,
    });
    expect(result.total).toBeGreaterThanOrEqual(1);
    result.data.forEach((opp) => {
      expect(opp.category).toBe('volunteer');
      expect(opp.location_city?.toLowerCase()).toBe('raleigh');
      expect(opp.is_free).toBe(true);
    });
  });

  it('sorts by deadline ascending', () => {
    const result = getOpportunities({ sort: 'deadline_asc', per_page: 100 });
    const deadlines = result.data
      .filter((o) => o.deadline_at != null)
      .map((o) => new Date(o.deadline_at!).getTime());
    for (let i = 1; i < deadlines.length; i++) {
      expect(deadlines[i]).toBeGreaterThanOrEqual(deadlines[i - 1]);
    }
  });

  it('sorts by created_desc (default)', () => {
    const result = getOpportunities({ sort: 'created_desc', per_page: 100 });
    const created = result.data.map((o) => new Date(o.created_at).getTime());
    for (let i = 1; i < created.length; i++) {
      expect(created[i]).toBeLessThanOrEqual(created[i - 1]);
    }
  });

  it('sorts by title ascending', () => {
    const result = getOpportunities({ sort: 'title_asc', per_page: 100 });
    const titles = result.data.map((o) => o.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  it('paginates correctly', () => {
    const perPage = 3;
    const page1 = getOpportunities({ per_page: perPage, page: 1 });
    const page2 = getOpportunities({ per_page: perPage, page: 2 });

    expect(page1.data.length).toBe(perPage);
    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
    expect(page1.total_pages).toBe(Math.ceil(page1.total / perPage));

    const page1Ids = page1.data.map((o) => o.id);
    const page2Ids = page2.data.map((o) => o.id);
    page2Ids.forEach((id) => {
      expect(page1Ids).not.toContain(id);
    });
  });

  it('returns empty results for non-matching search', () => {
    const result = getOpportunities({ search: 'xyznonexistenttermxyz' });
    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
    expect(result.total_pages).toBe(1);
  });
});
