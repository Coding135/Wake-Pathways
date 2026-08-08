import type { Metadata } from 'next';
import { CategoryLandingPage } from '@/components/seo/category-landing-page';
import {
  buildPageMetadata,
  getCategoryLandingBySlug,
  getCategoryLandingListings,
} from '@/lib/seo';

const SLUG = 'competitions' as const;

const config = getCategoryLandingBySlug(SLUG)!;

export const metadata: Metadata = buildPageMetadata({
  title: config.title,
  description: config.description,
  path: config.path,
});

export default function CompetitionsPage() {
  const listings = getCategoryLandingListings(config);
  return <CategoryLandingPage config={config} listings={listings} />;
}
