import type { IssueReportIssueType } from '@/types/database';

export const OPPORTUNITY_ISSUE_TYPES = [
  'outdated_information',
  'broken_link',
  'wrong_deadline',
  'incorrect_eligibility',
  'duplicate_listing',
  'no_longer_available',
  'other',
] as const satisfies readonly IssueReportIssueType[];

export type OpportunityIssueType = (typeof OPPORTUNITY_ISSUE_TYPES)[number];

export const OPPORTUNITY_ISSUE_TYPE_LABELS: Record<OpportunityIssueType, string> = {
  outdated_information: 'Outdated information',
  broken_link: 'Broken link',
  wrong_deadline: 'Wrong deadline',
  incorrect_eligibility: 'Incorrect eligibility',
  duplicate_listing: 'Duplicate listing',
  no_longer_available: 'No longer available',
  other: 'Other',
};
