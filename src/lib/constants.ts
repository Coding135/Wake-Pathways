import type {
  OpportunityCategory,
  RemoteType,
  PaidType,
  ApplicationStatus,
  DeadlineType,
  VerificationStatus,
} from '@/types/database';

// =============================================================================
// App metadata
// =============================================================================

export const APP_NAME = 'Wake Pathways';
export const APP_SHORT_NAME = 'Wake Pathways';
export const APP_DESCRIPTION =
  'Discover real internships, research experiences, volunteer roles, scholarships, and programs for teens in Wake County, NC.';

// =============================================================================
// Navigation
// =============================================================================

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Explore', href: '/opportunities' },
  { label: 'Submit', href: '/submit' },
  { label: 'Saved', href: '/saved' },
  { label: 'About', href: '/about' },
];

// =============================================================================
// Opportunity categories
// =============================================================================

export interface CategoryOption {
  value: OpportunityCategory;
  label: string;
  icon: string;
}

export const OPPORTUNITY_CATEGORIES: CategoryOption[] = [
  { value: 'internship', label: 'Internship', icon: 'Briefcase' },
  { value: 'volunteer', label: 'Volunteer', icon: 'Heart' },
  { value: 'scholarship', label: 'Scholarship', icon: 'GraduationCap' },
  { value: 'summer_program', label: 'Summer Program', icon: 'Sun' },
  { value: 'research', label: 'Research', icon: 'Microscope' },
  { value: 'competition', label: 'Competition', icon: 'Trophy' },
  { value: 'leadership', label: 'Leadership', icon: 'Users' },
  { value: 'job', label: 'Job', icon: 'DollarSign' },
  { value: 'mentorship', label: 'Mentorship', icon: 'MessageCircle' },
  { value: 'other', label: 'Other', icon: 'Sparkles' },
];

export const CATEGORY_MAP = Object.fromEntries(
  OPPORTUNITY_CATEGORIES.map((c) => [c.value, c])
) as Record<OpportunityCategory, CategoryOption>;

// =============================================================================
// Grade options
// =============================================================================

export interface GradeOption {
  value: number;
  label: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  { value: 6, label: '6th Grade' },
  { value: 7, label: '7th Grade' },
  { value: 8, label: '8th Grade' },
  { value: 9, label: '9th Grade' },
  { value: 10, label: '10th Grade' },
  { value: 11, label: '11th Grade' },
  { value: 12, label: '12th Grade' },
];

// =============================================================================
// Wake County cities
// =============================================================================

export const WAKE_COUNTY_CITIES = [
  'Raleigh',
  'Cary',
  'Apex',
  'Morrisville',
  'Holly Springs',
  'Fuquay-Varina',
  'Wake Forest',
  'Garner',
  'Knightdale',
  'Wendell',
  'Zebulon',
  'Rolesville',
] as const;

export type WakeCountyCity = (typeof WAKE_COUNTY_CITIES)[number];

// =============================================================================
// Filter option types
// =============================================================================

export interface LabeledOption<T extends string = string> {
  value: T;
  label: string;
}

export const REMOTE_TYPE_OPTIONS: LabeledOption<RemoteType>[] = [
  { value: 'in_person', label: 'In Person' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const PAID_TYPE_OPTIONS: LabeledOption<PaidType>[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'varies', label: 'Varies' },
];

export const APPLICATION_STATUS_OPTIONS: LabeledOption<ApplicationStatus>[] = [
  { value: 'open', label: 'Open' },
  { value: 'closing_soon', label: 'Closing Soon' },
  { value: 'rolling', label: 'Rolling' },
  { value: 'closed', label: 'Closed' },
  { value: 'unknown', label: 'Unknown' },
];

export const DEADLINE_TYPE_OPTIONS: LabeledOption<DeadlineType>[] = [
  { value: 'fixed', label: 'Fixed Deadline' },
  { value: 'rolling', label: 'Rolling' },
  { value: 'none', label: 'No Deadline' },
];

export const VERIFICATION_STATUS_OPTIONS: LabeledOption<VerificationStatus>[] = [
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'failed', label: 'Failed' },
  { value: 'unverified', label: 'Unverified' },
];

// =============================================================================
// Sort options
// =============================================================================

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'deadline_asc', label: 'Deadline (soonest)' },
  { value: 'deadline_desc', label: 'Deadline (latest)' },
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc', label: 'Oldest first' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
];
