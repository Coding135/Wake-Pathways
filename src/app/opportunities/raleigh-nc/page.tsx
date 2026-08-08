import type { Metadata } from 'next';
import { LocationLandingPage } from '@/components/seo/location-landing-page';
import {
  buildPageMetadata,
  getLocationLandingBySlug,
  getLocationLandingListings,
} from '@/lib/seo';

const SLUG = 'raleigh-nc' as const;
const config = getLocationLandingBySlug(SLUG)!;

export const metadata: Metadata = buildPageMetadata({
  title: config.title,
  description: config.description,
  path: config.path,
});

export default function RaleighOpportunitiesPage() {
  const listings = getLocationLandingListings(config.city);
  return <LocationLandingPage config={config} listings={listings} />;
}
