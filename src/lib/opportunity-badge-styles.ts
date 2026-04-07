import type { OpportunityCategory } from '@/types/database';

/**
 * Category pills on cards and detail pages — tuned separately per theme in CSS.
 */
export const CATEGORY_BADGE_CLASSES: Record<OpportunityCategory, string> = {
  internship: 'opp-cat-internship',
  volunteer: 'opp-cat-volunteer',
  scholarship: 'opp-cat-scholarship',
  summer_program: 'opp-cat-summer-program',
  research: 'opp-cat-research',
  competition: 'opp-cat-competition',
  leadership: 'opp-cat-leadership',
  job: 'opp-cat-job',
  mentorship: 'opp-cat-mentorship',
  other: 'opp-cat-other',
};

/** Homepage “Browse by Category” icon squares. */
export const CATEGORY_HOME_TILE_CLASSES: Record<OpportunityCategory, string> = {
  internship: 'home-tile-internship',
  volunteer: 'home-tile-volunteer',
  scholarship: 'home-tile-scholarship',
  summer_program: 'home-tile-summer-program',
  research: 'home-tile-research',
  competition: 'home-tile-competition',
  leadership: 'home-tile-leadership',
  job: 'home-tile-job',
  mentorship: 'home-tile-mentorship',
  other: 'home-tile-other',
};
