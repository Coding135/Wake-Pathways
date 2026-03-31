import type { OpportunityCategory } from '@/types/database';

/**
 * Category pills: light mode matches pre–dark-mode Wake Pathways; dark: is isolated.
 */
export const CATEGORY_BADGE_CLASSES: Record<OpportunityCategory, string> = {
  internship:
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/55 dark:text-blue-100 dark:ring-blue-400/30',
  volunteer:
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-400/30',
  scholarship:
    'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/55 dark:text-purple-100 dark:ring-purple-400/30',
  summer_program:
    'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/10 dark:bg-orange-950/50 dark:text-orange-100 dark:ring-orange-400/30',
  competition:
    'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-400/30',
  leadership:
    'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/55 dark:text-indigo-100 dark:ring-indigo-400/30',
  job: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-950/50 dark:text-teal-100 dark:ring-teal-400/30',
  mentorship:
    'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-700/10 dark:bg-pink-950/50 dark:text-pink-100 dark:ring-pink-400/30',
  other:
    'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-stone-800/80 dark:text-stone-100 dark:ring-stone-400/25',
};

/** Homepage category grid tiles (original light hovers; dark: separate). */
export const CATEGORY_HOME_TILE_CLASSES: Record<OpportunityCategory, string> = {
  internship:
    'bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-950/45 dark:text-blue-300 dark:group-hover:bg-blue-950/70',
  volunteer:
    'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-950/45 dark:text-emerald-300 dark:group-hover:bg-emerald-950/70',
  scholarship:
    'bg-purple-50 text-purple-600 group-hover:bg-purple-100 dark:bg-purple-950/45 dark:text-purple-300 dark:group-hover:bg-purple-950/70',
  summer_program:
    'bg-orange-50 text-orange-600 group-hover:bg-orange-100 dark:bg-orange-950/45 dark:text-orange-300 dark:group-hover:bg-orange-950/70',
  competition:
    'bg-rose-50 text-rose-600 group-hover:bg-rose-100 dark:bg-rose-950/45 dark:text-rose-300 dark:group-hover:bg-rose-950/70',
  leadership:
    'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-950/45 dark:text-indigo-300 dark:group-hover:bg-indigo-950/70',
  job: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100 dark:bg-teal-950/45 dark:text-teal-300 dark:group-hover:bg-teal-950/70',
  mentorship:
    'bg-pink-50 text-pink-600 group-hover:bg-pink-100 dark:bg-pink-950/45 dark:text-pink-300 dark:group-hover:bg-pink-950/70',
  other:
    'bg-gray-50 text-gray-600 group-hover:bg-gray-100 dark:bg-stone-800/70 dark:text-stone-200 dark:group-hover:bg-stone-800',
};

export const VERIFIED_OPPORTUNITY_BADGE_CLASSES =
  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-400/30';
