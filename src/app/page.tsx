import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Users,
  Briefcase,
  Heart,
  GraduationCap,
  Sun,
  Trophy,
  DollarSign,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { getFeaturedOpportunities, getCategoryStats, getOpportunities } from '@/lib/mock-data';
import { CATEGORY_MAP } from '@/lib/constants';
import type { OpportunityCategory } from '@/types/database';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { CATEGORY_HOME_TILE_CLASSES } from '@/lib/opportunity-badge-styles';
import { HeroSearchBar } from './hero-search';
import { AnimatedSection } from './animated-section';

const CATEGORY_ICONS: Record<OpportunityCategory, React.ElementType> = {
  internship: Briefcase,
  volunteer: Heart,
  scholarship: GraduationCap,
  summer_program: Sun,
  competition: Trophy,
  leadership: Users,
  job: DollarSign,
  mentorship: MessageCircle,
  other: Sparkles,
};

const QUICK_CATEGORIES: OpportunityCategory[] = [
  'internship',
  'volunteer',
  'scholarship',
  'summer_program',
  'job',
  'leadership',
];

export default function HomePage() {
  const featured = getFeaturedOpportunities();
  const categoryStats = getCategoryStats();

  const deadlinesComingUp = getOpportunities({
    sort: 'deadline_asc',
    per_page: 50,
  }).data.filter((o) => {
    if (!o.deadline_at) return false;
    const d = new Date(o.deadline_at);
    const now = new Date();
    if (d <= now) return false;
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  }).slice(0, 4);

  return (
    <>
      {/* ===== Hero ===== */}
      {/* Light hero: screenshot 3 — bright center, soft cool lavender/ice-blue at periphery (no green/mint wash). */}
      <section className="relative overflow-hidden bg-white dark:bg-[#09090b]">
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse 110% 90% at 50% -15%, #ffffff 0%, transparent 52%)',
              'radial-gradient(ellipse 85% 70% at 100% 0%, rgb(219 234 254 / 0.42), transparent 55%)',
              'radial-gradient(ellipse 80% 65% at 0% 100%, rgb(224 231 255 / 0.38), transparent 50%)',
              'radial-gradient(ellipse 100% 80% at 50% 100%, rgb(238 242 255 / 0.25), transparent 45%)',
            ].join(', '),
          }}
        />
        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgb(39_39_42/0.55),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgb(30_58_138/0.12),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm sm:mb-5 sm:text-sm dark:border-border dark:bg-card dark:text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
              Wake County, NC
            </span>

            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Real opportunities for{' '}
              <span className="bg-gradient-to-r from-teal-500 via-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-sky-300 dark:to-blue-400">
                Wake County teens
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg md:text-xl">
              Find verified internships, volunteer roles, scholarships, summer programs, jobs, and more in one place.
            </p>

            <div className="mt-8">
              <HeroSearchBar />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 px-0.5 sm:mt-6">
              {QUICK_CATEGORIES.map((cat) => {
                const info = CATEGORY_MAP[cat];
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <Link
                    key={cat}
                    href={`/opportunities?category=${cat}`}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm sm:text-sm',
                      'hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100',
                      'dark:border-border dark:bg-card dark:hover:bg-secondary touch-manipulation'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-foreground" />
                    <span className="leading-tight">{info.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ===== Featured ===== */}
      <AnimatedSection className="bg-[var(--section-featured-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-foreground text-balance sm:text-2xl md:text-3xl">
              Featured Opportunities
            </h2>
            <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
              Highlighted programs worth checking out
            </p>
          </div>
          <Link
            href="/opportunities"
            className={cn(buttonVariants({ variant: 'ghost' }), 'hidden shrink-0 gap-1 sm:inline-flex')}
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/opportunities"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1')}
          >
            See all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        </div>
      </AnimatedSection>

      {/* ===== Deadlines Coming Up ===== */}
      {deadlinesComingUp.length > 0 && (
        <AnimatedSection className="border-y border-[color:var(--section-deadlines-border)] bg-[var(--section-deadlines-bg)]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-foreground text-balance sm:text-2xl md:text-3xl">
                  Deadlines coming up
                </h2>
                <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
                  These opportunities close within the next two weeks
                </p>
              </div>
              <Link
                href="/opportunities?sort=deadline_asc"
                className={cn(buttonVariants({ variant: 'ghost' }), 'hidden shrink-0 gap-1 sm:inline-flex')}
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {deadlinesComingUp.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ===== Categories ===== */}
      <AnimatedSection className="bg-[var(--section-browse-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse by Category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categoryStats.map(({ category, count }) => {
              const info = CATEGORY_MAP[category];
              const Icon = CATEGORY_ICONS[category];
              return (
                <Link
                  key={category}
                  href={`/opportunities?category=${category}`}
                  className="group flex min-h-[4.25rem] items-center gap-2.5 rounded-xl border border-border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] dark:bg-card dark:shadow-none sm:gap-3 sm:p-4 touch-manipulation"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10',
                      CATEGORY_HOME_TILE_CLASSES[category]
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug text-foreground sm:text-sm">
                      <span className="line-clamp-2 sm:line-clamp-1 sm:truncate">{info.label}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                      {count} listing{count === 1 ? '' : 's'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== Why Trust Wake Pathways ===== */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why trust Wake Pathways?
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Every listing links to an official source and shows when it was last checked.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Official sources only',
              description: 'Listings come from city, county, nonprofit, and university websites.',
            },
            {
              icon: CheckCircle2,
              title: 'Source date shown',
              description: 'Every listing displays when it was last verified, so you know it is current.',
            },
            {
              icon: MapPin,
              title: 'Local to Wake County',
              description: 'Focused on Raleigh, Cary, Apex, and surrounding communities.',
            },
            {
              icon: AlertCircle,
              title: 'Unknown means unknown',
              description: 'If we are not sure about a detail, we say so instead of guessing.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card dark:shadow-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <item.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/how-it-works"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1')}
          >
            Learn how it works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AnimatedSection>

      {/* ===== CTA ===== */}
      <section className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm dark:bg-card dark:shadow-none sm:p-10">
              <h3 className="text-lg font-bold text-foreground text-balance sm:text-xl">
                Know about an opportunity?
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                Help Wake County teens by submitting a listing. Our team will verify it and make it available to everyone.
              </p>
              <Link
                href="/submit"
                className={cn(buttonVariants(), 'mt-5 w-full gap-1 sm:mt-6 sm:w-auto touch-manipulation')}
              >
                Submit a listing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
