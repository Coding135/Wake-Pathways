import type { Metadata } from 'next';
import { CategoryLandingPage } from '@/components/seo/category-landing-page';
import {
  buildPageMetadata,
  getCategoryLandingBySlug,
  getCategoryLandingListings,
} from '@/lib/seo';

const SLUG = 'volunteer' as const;

const config = getCategoryLandingBySlug(SLUG)!;

export const metadata: Metadata = buildPageMetadata({
  title: config.title,
  description: config.description,
  path: config.path,
});

export default function VolunteerPage() {
  const listings = getCategoryLandingListings(config);
  return <CategoryLandingPage config={config} listings={listings} />;
}
