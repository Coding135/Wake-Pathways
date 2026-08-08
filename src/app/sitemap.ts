import type { MetadataRoute } from 'next';
import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';
import {
  CATEGORY_LANDINGS,
  LOCATION_LANDINGS,
  SITE_URL,
  absoluteUrl,
} from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/browse'),
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/opportunities'),
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/submit'),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...CATEGORY_LANDINGS.map((c) => ({
      url: absoluteUrl(c.path),
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...LOCATION_LANDINGS.map((l) => ({
      url: absoluteUrl(l.path),
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  const listingEntries: MetadataRoute.Sitemap = MOCK_OPPORTUNITIES.filter(
    (o) => o.is_active
  ).map((o) => ({
    url: absoluteUrl(`/opportunities/${o.slug}`),
    lastModified: new Date(o.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...listingEntries];
}
