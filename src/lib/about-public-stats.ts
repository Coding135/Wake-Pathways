import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';

/**
 * Rounded public figure aligned with Wake County Public Schools district enrollment
 * (2024–25 10-Day Average Daily Membership, about 161,115 students per WCPSS budget
 * and district “Stats and Facts” style reporting). Rounded for a clean stat line; see
 * https://www.wcpss.net/ for current district figures.
 */
export const WCPSS_ENROLLMENT_DISPLAY = '161,000+';

export function getAboutPageListingStats() {
  const active = MOCK_OPPORTUNITIES.filter((o) => o.is_active);
  const verifiedActiveListings = active.filter((o) => o.verified).length;
  const organizationsRepresented = new Set(
    active.map((o) => o.organization_id).filter((id): id is string => Boolean(id))
  ).size;
  const citiesCovered = new Set(
    active.map((o) => o.location_city).filter((c): c is string => Boolean(c?.trim()))
  ).size;
  return {
    verifiedActiveListings,
    organizationsRepresented,
    citiesCovered,
  };
}
