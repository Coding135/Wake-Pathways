import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Submit an Opportunity | Wake Pathways',
  description:
    'Submit a free listing to reach Wake County high school students actively looking for internships, scholarships, and volunteer opportunities.',
  path: '/submit',
});

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
