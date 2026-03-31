import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Users,
  Heart,
  Search,
  CheckCircle2,
  UserPlus,
  ClipboardCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { APP_SHORT_NAME } from '@/lib/constants';
import { WCPSS_ENROLLMENT_DISPLAY, getAboutPageListingStats } from '@/lib/about-public-stats';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `About - ${APP_SHORT_NAME}`,
  description: `Learn about ${APP_SHORT_NAME} and how we help Wake County teens find real, verified local opportunities.`,
};

const DIFFERENTIATORS = [
  {
    icon: ShieldCheck,
    title: 'Official sources only',
    description: 'We pull from city, county, nonprofit, school, museum, hospital, and university pages. Every listing links to an official source.',
  },
  {
    icon: MapPin,
    title: 'Wake County focus',
    description: 'Raleigh, Cary, Apex, Morrisville, and surrounding communities. No generic national aggregator content.',
  },
  {
    icon: Search,
    title: 'Unclear details are labeled',
    description: 'If we cannot confirm a detail from the source, we mark it as unknown instead of guessing.',
  },
  {
    icon: CheckCircle2,
    title: 'Expired listings removed',
    description: 'Opportunities are reviewed regularly. Closed, stale, or unverifiable listings are taken down.',
  },
];

const STEPS = [
  {
    icon: Search,
    title: 'Research real sources',
    description: 'We check city, county, school, nonprofit, and university sites for teen programs, jobs, and scholarships.',
  },
  {
    icon: UserPlus,
    title: 'Accept community submissions',
    description: 'Teachers, parents, counselors, and organizations can submit opportunities they know about.',
  },
  {
    icon: ClipboardCheck,
    title: 'Verify before publishing',
    description: 'Every listing is checked against its official source. We confirm details like eligibility, deadlines, and costs.',
  },
  {
    icon: RefreshCw,
    title: 'Remove what expires',
    description: 'Closed or unverifiable listings are taken down. Active listings show when they were last checked.',
  },
];

export default function AboutPage() {
  const { verifiedActiveListings, opportunityCategoryCount } = getAboutPageListingStats();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Hero */}
      <header className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          About {APP_SHORT_NAME}
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
          A free, community-driven resource helping Wake County teens discover
          real internships, volunteer work, scholarships, summer programs, and more.
        </p>
      </header>

      {/* Mission */}
      <section className="mb-16 rounded-2xl border border-border bg-white p-8 text-center shadow-sm dark:bg-card dark:shadow-none sm:p-10">
        <Heart className="mx-auto h-8 w-8 text-primary mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
        <p className="mt-3 mx-auto max-w-xl leading-relaxed text-muted-foreground">
          No teenager in Wake County should miss out on an opportunity simply because they
          did not know it existed. {APP_SHORT_NAME} makes it easier for students, parents,
          and counselors to find what matters.
        </p>
      </section>

      {/* Why this matters / By the numbers */}
      <section
        className="mb-16 scroll-mt-24 rounded-2xl border border-border bg-muted/25 p-8 dark:bg-muted/10 sm:p-10"
        aria-labelledby="about-why-heading"
      >
        <h2
          id="about-why-heading"
          className="text-2xl font-bold tracking-tight text-foreground text-center"
        >
          Why this matters
        </h2>
        <p className="mx-auto mt-2 text-center text-sm font-medium uppercase tracking-wider text-primary">
          By the numbers
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
          Wake County has a large student population, but opportunities are often scattered across
          school emails, nonprofit sites, university pages, and job boards. {APP_SHORT_NAME} brings
          verified opportunities into one place so students can find them faster and miss fewer
          deadlines.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-6 text-center shadow-sm dark:bg-card dark:shadow-none">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {WCPSS_ENROLLMENT_DISPLAY}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">students in WCPSS</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
              Public district enrollment, rounded (see{' '}
              <a
                href="https://www.wcpss.net/"
                className="text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                wcpss.net
              </a>{' '}
              for current figures).
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6 text-center shadow-sm dark:bg-card dark:shadow-none">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {verifiedActiveListings}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">verified opportunities</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
              Active listings on {APP_SHORT_NAME} today, sourced and checked against official pages.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6 text-center shadow-sm dark:bg-card dark:shadow-none">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {opportunityCategoryCount}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">browse categories</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
              From internships and jobs to scholarships, programs, volunteering, and more.
            </p>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-8">
          What makes us different
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card dark:shadow-none"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-8">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-sm font-bold text-primary">{i + 1}</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm dark:bg-card dark:shadow-none sm:p-10">
        <Users className="mx-auto h-8 w-8 text-primary mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Built by the community</h2>
        <p className="mt-3 mx-auto max-w-xl leading-relaxed text-muted-foreground">
          {APP_SHORT_NAME} is maintained by community members who care about youth
          development in Wake County. Want to help? Submit an opportunity or spread the word.
        </p>
        <div className="mt-6">
          <Link
            href="/submit"
            className={cn(buttonVariants(), 'gap-1')}
          >
            Submit an opportunity
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
