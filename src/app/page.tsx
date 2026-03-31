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
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-[#faf8fc] to-blue-50/35 dark:from-primary/10 dark:via-background dark:to-blue-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(13,148,136,0.04),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(129,140,248,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(45,212,191,0.08),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm dark:border-border dark:bg-card dark:text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-foreground/70" />
              Wake County, NC
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Real opportunities for{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-teal-300 dark:to-blue-400">
                Wake County teens
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Find verified internships, volunteer roles, scholarships, summer programs, jobs, and more in one place.
            </p>

            <div className="mt-8">
              <HeroSearchBar />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {QUICK_CATEGORIES.map((cat) => {
                const info = CATEGORY_MAP[cat];
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <Link
                    key={cat}
                    href={`/opportunities?category=${cat}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm',
                      'hover:border-stone-300/90 hover:bg-stone-50/90',
                      'dark:border-border dark:bg-card dark:hover:bg-secondary'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-foreground" />
                    {info.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ===== Featured ===== */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Opportunities
            </h2>
            <p className="mt-1 text-muted-foreground">
              Highlighted programs worth checking out
            </p>
          </div>
          <Link
            href="/opportunities"
            className={cn(buttonVariants({ variant: 'ghost' }), 'hidden gap-1 sm:inline-flex')}
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
      </AnimatedSection>

      {/* ===== Deadlines Coming Up ===== */}
      {deadlinesComingUp.length > 0 && (
        <AnimatedSection className="border-y border-amber-200/40 bg-amber-50/45 dark:border-amber-900/40 dark:bg-amber-950/25">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Deadlines coming up
                </h2>
                <p className="mt-1 text-muted-foreground">
                  These opportunities close within the next two weeks
                </p>
              </div>
              <Link
                href="/opportunities?sort=deadline_asc"
                className={cn(buttonVariants({ variant: 'ghost' }), 'hidden gap-1 sm:inline-flex')}
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
      <AnimatedSection className="bg-muted/30">
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
                  className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-card dark:shadow-none"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                      CATEGORY_HOME_TILE_CLASSES[category]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {info.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
            <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm dark:bg-card dark:shadow-none sm:p-10">
              <h3 className="text-xl font-bold text-foreground">
                Know about an opportunity?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Help Wake County teens by submitting a listing. Our team will verify it and make it available to everyone.
              </p>
              <Link
                href="/submit"
                className={cn(buttonVariants(), 'mt-6 gap-1')}
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
