import { getPublicListingStats } from '@/lib/mock-data';

/**
 * Rounded public figure aligned with Wake County Public Schools district enrollment
 * (2024–25 10-Day Average Daily Membership, about 161,115 students per WCPSS budget
 * and district “Stats and Facts” style reporting). Rounded for a clean stat line; see
 * https://www.wcpss.net/ for current district figures.
 */
export const WCPSS_ENROLLMENT_DISPLAY = '161,000+';

export function getAboutPageListingStats() {
  const s = getPublicListingStats();
  return {
    activeOpportunities: s.activeListings,
    organizationsRepresented: s.organizationsRepresented,
    citiesCovered: s.citiesCovered,
  };
}
