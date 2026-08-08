import type { Metadata } from 'next';
import type { OpportunityCategory, OpportunityWithOrganization } from '@/types/database';
import { getOpportunities, MOCK_OPPORTUNITIES } from '@/lib/mock-data';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://wakepathways.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Wake Pathways';

export const ORGANIZATION_DESCRIPTION =
  'Wake Pathways is a free resource for Wake County, NC high school students to find internships, scholarships, volunteer opportunities, competitions, workshops, and community events. We aggregate opportunities from local nonprofits, government programs, companies, and community organizations across Raleigh, Cary, Apex, Holly Springs, Morrisville, and the greater Triangle area — all in one place, updated weekly, and completely free to use.';

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: '/brand/og-card.svg',
          width: 1200,
          height: 630,
          alt: 'Wake Pathways - real opportunities for Wake County teens',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/brand/og-card.svg'],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: ORGANIZATION_DESCRIPTION,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Wake County, NC',
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type SeoFaqItem = { question: string; answer: string };

export type CategoryLandingConfig = {
  slug: string;
  path: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  browseLinkLabel: string;
  exploreMoreLabel: string;
  category?: OpportunityCategory;
  /** Extra tag match when category alone is not enough (workshops/events). */
  tagIncludes?: string[];
  /** Match title/summary/description keywords (case-insensitive). */
  keywordIncludes?: string[];
  faqs: SeoFaqItem[];
};

export const CATEGORY_LANDINGS: CategoryLandingConfig[] = [
  {
    slug: 'internships',
    path: '/internships',
    h1: 'Wake County High School Internships',
    title: 'Wake County Internships for High School Students | Wake Pathways',
    description:
      'Find real internships in Wake County, NC for high school students. Browse paid and unpaid internship opportunities in Raleigh, Cary, Apex, and surrounding areas.',
    intro:
      'Wake Pathways aggregates internship opportunities across Wake County for students in grades 9–12, including paid positions and exploratory internships at local companies and nonprofits. Whether you are exploring a career path in Raleigh or looking for a first workplace experience in Cary or Apex, these listings help you find roles that fit your schedule and interests.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Wake County Internships',
    category: 'internship',
    faqs: [
      {
        question: 'Are Wake County high school internships paid?',
        answer:
          'Some internships are paid, some offer stipends, and others are unpaid exploratory experiences. Each listing on Wake Pathways shows compensation details when the official source provides them.',
      },
      {
        question: 'Who can apply for these internships?',
        answer:
          'Most listings are aimed at Wake County high school students in grades 9–12. Always check eligibility, grade range, and location on the official application page linked from each listing.',
      },
      {
        question: 'How often are internship listings updated?',
        answer:
          'Wake Pathways is updated weekly with new and verified opportunities from local organizations across the Triangle.',
      },
    ],
  },
  {
    slug: 'scholarships',
    path: '/scholarships',
    h1: 'Scholarships for Wake County High School Students',
    title: 'Wake County Scholarships for High School Students | Wake Pathways',
    description:
      'Browse local and national scholarships available to Wake County, NC high school students. Updated regularly with new awards and deadlines.',
    intro:
      'Find scholarships for students in Wake County, including local foundations, state programs, and national awards with connections to the Triangle region. Use these listings to track deadlines, eligibility, and official application links in one place.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Wake County Scholarships',
    category: 'scholarship',
    faqs: [
      {
        question: 'Are these scholarships only for Wake County residents?',
        answer:
          'Many awards prioritize Wake County or North Carolina students, while some national scholarships are open more broadly. Each listing notes eligibility based on the official source.',
      },
      {
        question: 'Do I need to be a senior to apply?',
        answer:
          'Not always. Some scholarships are open to underclassmen, while others target graduating seniors. Check the grade and age requirements on each listing.',
      },
      {
        question: 'Is Wake Pathways free to use for scholarship searches?',
        answer:
          'Yes. Wake Pathways is completely free for students and families searching scholarships and other opportunities.',
      },
    ],
  },
  {
    slug: 'volunteer',
    path: '/volunteer',
    h1: 'Volunteer Opportunities for Teens in Wake County',
    title: 'Teen Volunteer Opportunities in Wake County, NC | Wake Pathways',
    description:
      'Find volunteer opportunities for teens in Raleigh, Cary, Apex, and Wake County, NC. Earn community service hours and build your resume.',
    intro:
      'Looking for community service hours, NHS requirements, or meaningful volunteer work at local nonprofits and government programs? Wake Pathways lists teen volunteer opportunities across Raleigh, Cary, Apex, and the rest of Wake County so you can give back and build experience.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Teen Volunteer Opportunities',
    category: 'volunteer',
    faqs: [
      {
        question: 'Can these volunteer roles count toward NHS or graduation hours?',
        answer:
          'Many do, but requirements vary by school and club. Confirm with your advisor and the hosting organization before counting hours.',
      },
      {
        question: 'What ages can volunteer?',
        answer:
          'Most listings are for high school teens, though some programs accept middle school students. Age and grade limits are shown on each listing when available.',
      },
      {
        question: 'Are volunteer opportunities in Wake County free to join?',
        answer:
          'Volunteer roles themselves are typically unpaid community service. Any fees or requirements are noted when the official source lists them.',
      },
    ],
  },
  {
    slug: 'competitions',
    path: '/competitions',
    h1: 'Competitions and Challenges for Wake County Students',
    title: 'Student Competitions & Academic Challenges in Wake County | Wake Pathways',
    description:
      'Find FBLA, DECA, science olympiad, hackathons, pitch competitions, and more for Wake County high school students.',
    intro:
      'Discover academic competitions, business competitions, STEM challenges, and arts competitions open to students in Wake County. From pitch contests to olympiads and hackathons, these listings help you find challenges that match your interests and deadlines.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Student Competitions',
    category: 'competition',
    faqs: [
      {
        question: 'Do I need a school team to compete?',
        answer:
          'Some competitions require a school chapter or team, while others accept individual entries. Check each listing’s eligibility details and official rules.',
      },
      {
        question: 'Are competitions only STEM-focused?',
        answer:
          'No. Wake Pathways includes STEM, business, leadership, and arts challenges available to Wake County students.',
      },
      {
        question: 'How do I find competitions with upcoming deadlines?',
        answer:
          'Browse the competitions on this page or use Explore to sort by deadline and filter by category.',
      },
    ],
  },
  {
    slug: 'workshops',
    path: '/workshops',
    h1: 'Workshops and Programs for Wake County Students',
    title: 'Student Workshops & Programs in Wake County, NC | Wake Pathways',
    description:
      'Discover free and low-cost workshops, training programs, and skill-building events for Wake County high school students.',
    intro:
      'Explore skill-building workshops, career exploration events, and professional development programs offered locally for Wake County high school students. These listings highlight free and low-cost summer programs, training sessions, and hands-on learning across the Triangle.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Student Workshops & Programs',
    category: 'summer_program',
    tagIncludes: ['workshop'],
    keywordIncludes: ['workshop', 'training', 'skill-building'],
    faqs: [
      {
        question: 'Are workshops free?',
        answer:
          'Many are free or low-cost; others charge tuition with scholarship options. Cost details appear on each listing when the source provides them.',
      },
      {
        question: 'When do most workshops and programs run?',
        answer:
          'Summer programs are common, but workshops and training events also run during the school year. Check dates and deadlines on each listing.',
      },
      {
        question: 'Who hosts these programs?',
        answer:
          'Listings come from museums, universities, nonprofits, and community organizations serving Wake County teens.',
      },
    ],
  },
  {
    slug: 'events',
    path: '/events',
    h1: 'Community Events for Wake County Teens',
    title: 'Teen Community Events in Wake County, NC | Wake Pathways',
    description:
      'Find community events, networking nights, youth summits, and local activities for teens in Raleigh, Cary, and Wake County.',
    intro:
      'Stay connected through community engagement, local youth events, and networking opportunities for high school students in the Triangle area. Wake Pathways highlights teen summits, community nights, and activities happening in Raleigh, Cary, and across Wake County.',
    browseLinkLabel: 'Browse all opportunities',
    exploreMoreLabel: 'Browse Teen Community Events',
    tagIncludes: ['event'],
    keywordIncludes: ['event', 'summit', 'networking', 'kickback', 'community night'],
    faqs: [
      {
        question: 'Are these events only in Raleigh?',
        answer:
          'No. Events may be in Raleigh, Cary, Apex, or elsewhere in Wake County and the Triangle. Location is listed on each opportunity card.',
      },
      {
        question: 'Do I need to register in advance?',
        answer:
          'Most youth events require registration, especially when space is limited. Use the official link on each listing to sign up.',
      },
      {
        question: 'Are community events free for teens?',
        answer:
          'Many are free. Any ticket price or fee is noted when the hosting organization publishes it.',
      },
    ],
  },
];

export type LocationLandingConfig = {
  slug: string;
  path: string;
  city: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
};

export const LOCATION_LANDINGS: LocationLandingConfig[] = [
  {
    slug: 'raleigh-nc',
    path: '/opportunities/raleigh-nc',
    city: 'Raleigh',
    h1: 'Opportunities for Students in Raleigh, NC',
    title: 'Internships & Opportunities for Students in Raleigh, NC | Wake Pathways',
    description:
      'Find internships, scholarships, and volunteer opportunities for high school students in Raleigh, NC.',
    intro:
      'Discover internships, scholarships, volunteer roles, competitions, and youth programs for high school students in Raleigh, NC. Wake Pathways brings Raleigh-area listings together so teens can explore local opportunities without searching dozens of websites.',
  },
  {
    slug: 'cary-nc',
    path: '/opportunities/cary-nc',
    city: 'Cary',
    h1: 'Opportunities for Students in Cary, NC',
    title: 'Internships & Opportunities for Students in Cary, NC | Wake Pathways',
    description:
      'Browse local internships, scholarships, and community service opportunities for high school students in Cary, NC.',
    intro:
      'Looking for internships, scholarships, and community service opportunities in Cary, NC? These listings highlight active options for Cary high school students across volunteering, programs, and career exploration.',
  },
  {
    slug: 'apex-nc',
    path: '/opportunities/apex-nc',
    city: 'Apex',
    h1: 'Opportunities for Students in Apex, NC',
    title: 'Internships & Opportunities for Students in Apex, NC | Wake Pathways',
    description:
      'Find internships, scholarships, volunteer opportunities, and programs for high school students in Apex, NC.',
    intro:
      'Explore internships, scholarships, volunteer opportunities, and student programs available to high school students in Apex, NC. Wake Pathways helps Apex teens find local and Wake County listings in one free directory.',
  },
  {
    slug: 'holly-springs-nc',
    path: '/opportunities/holly-springs-nc',
    city: 'Holly Springs',
    h1: 'Opportunities for Students in Holly Springs, NC',
    title: 'Internships & Opportunities for Students in Holly Springs, NC | Wake Pathways',
    description:
      'Browse internships, scholarships, and volunteer opportunities for high school students in Holly Springs, NC.',
    intro:
      'Find internships, scholarships, volunteer opportunities, and youth programs for high school students in Holly Springs, NC. Browse active Wake County listings that serve Holly Springs teens and nearby communities.',
  },
  {
    slug: 'morrisville-nc',
    path: '/opportunities/morrisville-nc',
    city: 'Morrisville',
    h1: 'Opportunities for Students in Morrisville, NC',
    title: 'Internships & Opportunities for Students in Morrisville, NC | Wake Pathways',
    description:
      'Find internships, scholarships, and community opportunities for high school students in Morrisville, NC.',
    intro:
      'Discover internships, scholarships, volunteer roles, and student programs for high school students in Morrisville, NC. Wake Pathways aggregates Triangle-area opportunities so Morrisville teens can apply with confidence.',
  },
];

function textMatchesKeywords(
  opp: { title: string; short_summary: string | null; full_description: string | null; tags: string[] },
  keywords: string[]
): boolean {
  const haystack = [
    opp.title,
    opp.short_summary ?? '',
    opp.full_description ?? '',
    ...opp.tags,
  ]
    .join(' ')
    .toLowerCase();
  return keywords.some((k) => haystack.includes(k.toLowerCase()));
}

export function getCategoryLandingListings(
  config: CategoryLandingConfig
): OpportunityWithOrganization[] {
  if (config.category && !config.tagIncludes && !config.keywordIncludes) {
    return getOpportunities({
      category: config.category,
      per_page: 500,
      sort: 'deadline_asc',
    }).data;
  }

  const orgMap = new Map(
    getOpportunities({ per_page: 500, sort: 'deadline_asc', application_status: 'all' }).data.map(
      (o) => [o.id, o]
    )
  );

  const matchedIds = new Set(
    MOCK_OPPORTUNITIES.filter((o) => {
      if (!o.is_active || o.application_status === 'closed') return false;
      if (config.category && o.category === config.category) return true;
      if (
        config.tagIncludes?.some((t) =>
          o.tags.some((tag) => tag.toLowerCase() === t.toLowerCase())
        )
      ) {
        return true;
      }
      if (config.keywordIncludes && textMatchesKeywords(o, config.keywordIncludes)) {
        return true;
      }
      return false;
    }).map((o) => o.id)
  );

  return [...matchedIds]
    .map((id) => orgMap.get(id))
    .filter((o): o is OpportunityWithOrganization => Boolean(o));
}

export function getLocationLandingListings(city: string): OpportunityWithOrganization[] {
  return getOpportunities({
    city,
    per_page: 500,
    sort: 'deadline_asc',
  }).data;
}

export function getCategoryLandingBySlug(slug: string): CategoryLandingConfig | undefined {
  return CATEGORY_LANDINGS.find((c) => c.slug === slug);
}

export function getLocationLandingBySlug(slug: string): LocationLandingConfig | undefined {
  return LOCATION_LANDINGS.find((l) => l.slug === slug);
}
