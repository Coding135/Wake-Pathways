import type {
  Organization,
  Opportunity,
  OpportunityWithOrganization,
  Submission,
  OpportunityCategory,
  RemoteType,
  PaidType,
  ApplicationStatus,
} from '@/types/database';

import listingsData from '../../data/verified-listings.json';
import { resolveDisplayStatus } from '@/lib/utils';
import {
  deriveOpportunityInterestIds,
  parseInterestParam,
  type OpportunityInterestId,
} from '@/lib/opportunity-interests';

// =============================================================================
// Map JSON data to typed arrays
// =============================================================================

const TIMESTAMP = '2026-03-30T00:00:00Z';

export const MOCK_ORGANIZATIONS: Organization[] = listingsData.organizations.map(
  (org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    website: org.website ?? null,
    description: org.description ?? null,
    logo_url: null,
    is_verified: org.is_verified,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  })
);

export const MOCK_OPPORTUNITIES: Opportunity[] = listingsData.opportunities.map(
  (opp) => ({
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    organization_id: opp.organization_id ?? null,
    category: opp.category as OpportunityCategory,
    short_summary: opp.short_summary ?? null,
    full_description: opp.full_description ?? null,
    eligibility: opp.eligibility ?? null,
    grades_min: opp.grades_min ?? null,
    grades_max: opp.grades_max ?? null,
    age_min: opp.age_min ?? null,
    age_max: opp.age_max ?? null,
    location_city: opp.location_city ?? null,
    location_county: opp.location_county ?? null,
    remote_type: opp.remote_type as RemoteType,
    paid_type: opp.paid_type as PaidType,
    compensation_text: opp.compensation_text ?? null,
    cost_text: opp.cost_text ?? null,
    is_free: opp.is_free,
    deadline_type: opp.deadline_type as Opportunity['deadline_type'],
    deadline_at: opp.deadline_at ?? null,
    application_status: resolveDisplayStatus({
      application_status: opp.application_status as ApplicationStatus,
      deadline_type: opp.deadline_type,
      deadline_at: opp.deadline_at ?? null,
    }),
    official_application_url: opp.official_application_url ?? null,
    source_url: opp.source_url ?? null,
    source_name: opp.source_name ?? null,
    source_type: 'official' as Opportunity['source_type'],
    verified: opp.verified,
    verification_status: opp.verification_status as Opportunity['verification_status'],
    last_verified_at: opp.last_verified_at ?? null,
    featured: opp.featured,
    is_active: opp.is_active,
    time_commitment: opp.time_commitment ?? null,
    tags: opp.tags ?? [],
    skills: Array.isArray(opp.skills) ? opp.skills : [],
    capacity_note: opp.capacity_note ?? null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  })
);

/** Frozen derived interests per listing for consistent filtering (no unstable snapshots). */
const OPPORTUNITY_INTEREST_IDS_BY_OPP = new Map<string, readonly OpportunityInterestId[]>(
  MOCK_OPPORTUNITIES.map((o) => [o.id, Object.freeze(deriveOpportunityInterestIds(o))])
);

export const MOCK_SUBMISSIONS: Submission[] = [];

// =============================================================================
// Query helpers
// =============================================================================

const ORG_MAP = new Map(MOCK_ORGANIZATIONS.map((o) => [o.id, o]));

function withOrganization(opp: Opportunity): OpportunityWithOrganization {
  return {
    ...opp,
    organization: opp.organization_id ? ORG_MAP.get(opp.organization_id) ?? null : null,
  };
}

export interface GetOpportunitiesParams {
  search?: string;
  category?: OpportunityCategory;
  city?: string;
  remote_type?: RemoteType;
  paid_type?: PaidType;
  /** Omit or leave unset: actionable listings (excludes closed). Use `'all'` to include closed. */
  application_status?: ApplicationStatus | 'all';
  grade?: number;
  age?: number;
  verified_only?: boolean;
  is_free?: boolean;
  /** Comma-separated validated interest ids; OR logic within this group. */
  interests?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export function getOpportunities(
  params: GetOpportunitiesParams = {}
): PaginatedResult<OpportunityWithOrganization> {
  const {
    search,
    category,
    city,
    remote_type,
    paid_type,
    application_status,
    grade,
    age,
    verified_only,
    is_free,
    interests,
    sort = 'created_desc',
    page = 1,
    per_page = 12,
  } = params;

  let filtered = MOCK_OPPORTUNITIES.filter((o) => o.is_active);

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.short_summary?.toLowerCase().includes(q) ||
        o.full_description?.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (category) {
    filtered = filtered.filter((o) => o.category === category);
  }

  if (city) {
    filtered = filtered.filter(
      (o) => o.location_city?.toLowerCase() === city.toLowerCase()
    );
  }

  if (remote_type) {
    filtered = filtered.filter((o) => o.remote_type === remote_type);
  }

  if (paid_type) {
    filtered = filtered.filter((o) => o.paid_type === paid_type);
  }

  if (application_status === 'all') {
    // no status filter
  } else if (application_status) {
    filtered = filtered.filter((o) => o.application_status === application_status);
  } else {
    filtered = filtered.filter((o) => o.application_status !== 'closed');
  }

  if (grade != null) {
    filtered = filtered.filter(
      (o) =>
        (o.grades_min == null || grade >= o.grades_min) &&
        (o.grades_max == null || grade <= o.grades_max)
    );
  }

  if (age != null) {
    filtered = filtered.filter(
      (o) =>
        (o.age_min == null || age >= o.age_min) &&
        (o.age_max == null || age <= o.age_max)
    );
  }

  if (verified_only) {
    filtered = filtered.filter((o) => o.verified);
  }

  if (is_free) {
    filtered = filtered.filter((o) => o.is_free);
  }

  const interestFilter = parseInterestParam(interests);
  if (interestFilter.length > 0) {
    filtered = filtered.filter((o) => {
      const ids = OPPORTUNITY_INTEREST_IDS_BY_OPP.get(o.id);
      if (!ids || ids.length === 0) return false;
      return interestFilter.some((i) => ids.includes(i));
    });
  }

  filtered = sortOpportunities(filtered, sort);

  const total = filtered.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const start = (page - 1) * per_page;
  const paged = filtered.slice(start, start + per_page);

  return {
    data: paged.map(withOrganization),
    total,
    page,
    per_page,
    total_pages,
  };
}

function sortOpportunities(opps: Opportunity[], sort: string): Opportunity[] {
  const sorted = [...opps];

  switch (sort) {
    case 'deadline_asc':
      return sorted.sort((a, b) => {
        if (!a.deadline_at && !b.deadline_at) return 0;
        if (!a.deadline_at) return 1;
        if (!b.deadline_at) return -1;
        return new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime();
      });
    case 'deadline_desc':
      return sorted.sort((a, b) => {
        if (!a.deadline_at && !b.deadline_at) return 0;
        if (!a.deadline_at) return 1;
        if (!b.deadline_at) return -1;
        return new Date(b.deadline_at).getTime() - new Date(a.deadline_at).getTime();
      });
    case 'created_asc':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'title_asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title_desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'created_desc':
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export function getOpportunityBySlug(
  slug: string
): OpportunityWithOrganization | null {
  const opp = MOCK_OPPORTUNITIES.find((o) => o.slug === slug);
  if (!opp) return null;
  return withOrganization(opp);
}

export function getFeaturedOpportunities(): OpportunityWithOrganization[] {
  return MOCK_OPPORTUNITIES.filter((o) => o.featured && o.is_active)
    .sort((a, b) => {
      const aActive = a.application_status !== 'closed' ? 1 : 0;
      const bActive = b.application_status !== 'closed' ? 1 : 0;
      return bActive - aActive;
    })
    .map(withOrganization);
}

export function getOrganizations(): Organization[] {
  return [...MOCK_ORGANIZATIONS];
}

export function getOrganizationBySlug(slug: string): Organization | null {
  return MOCK_ORGANIZATIONS.find((o) => o.slug === slug) ?? null;
}

export function getOpportunitiesByOrganization(
  orgId: string
): OpportunityWithOrganization[] {
  return MOCK_OPPORTUNITIES.filter((o) => o.organization_id === orgId && o.is_active).map(
    withOrganization
  );
}

export function getSubmissions(
  statusFilter?: string
): Submission[] {
  if (!statusFilter || statusFilter === 'all') {
    return [...MOCK_SUBMISSIONS];
  }
  return MOCK_SUBMISSIONS.filter((s) => s.status === statusFilter);
}

export function getSubmissionById(id: string): Submission | null {
  return MOCK_SUBMISSIONS.find((s) => s.id === id) ?? null;
}

export function getCategoryStats(): { category: OpportunityCategory; count: number }[] {
  const counts = new Map<OpportunityCategory, number>();
  for (const opp of MOCK_OPPORTUNITIES.filter((o) => o.is_active)) {
    counts.set(opp.category, (counts.get(opp.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
