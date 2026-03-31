import type { Metadata } from 'next';
import {
  Search,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Globe,
  ClipboardCheck,
} from 'lucide-react';
import { APP_SHORT_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `How It Works - ${APP_SHORT_NAME}`,
  description:
    'Learn how opportunities are curated, verified, and kept up-to-date on Wake Pathways.',
};

const STEPS = [
  {
    icon: Search,
    title: 'We find opportunities',
    description:
      'Our team scans school districts, city programs, nonprofits, and local organizations for youth-focused opportunities across Wake County.',
  },
  {
    icon: UserPlus,
    title: 'Community submissions',
    description:
      'Anyone can submit an opportunity they know about. Teachers, parents, counselors, and organizations regularly contribute listings.',
  },
  {
    icon: ClipboardCheck,
    title: 'We verify the details',
    description:
      'Every listing is reviewed by a real person. We check the source URL, confirm key details, and make sure the opportunity is genuine and current.',
  },
  {
    icon: RefreshCw,
    title: 'Ongoing review',
    description:
      'Listings are revisited regularly. Expired or unverifiable opportunities are removed so you can trust what you see.',
  },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: 'Verified',
    color: 'bg-emerald-100 text-emerald-700',
    description:
      'Source URL confirmed, details checked, and listing reviewed by a team member.',
  },
  {
    icon: Globe,
    label: 'Source linked',
    color: 'bg-blue-100 text-blue-700',
    description:
      'Every verified listing includes a direct link to the official application or information page.',
  },
  {
    icon: CheckCircle2,
    label: 'Recently reviewed',
    color: 'bg-teal-100 text-teal-700',
    description:
      'The listing has been checked within the current review cycle and is believed to be active.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Heading */}
      <header className="mb-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How It Works
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {APP_SHORT_NAME} is built on trust. Here&rsquo;s how opportunities
          get from the real world onto this site, and how we keep things
          honest.
        </p>
      </header>

      {/* Steps */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-foreground">
          From discovery to your screen
        </h2>
        <ol className="mt-8 space-y-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  <span className="mr-2 text-sm font-semibold text-primary">
                    {i + 1}.
                  </span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What "verified" means */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-foreground">
          What &ldquo;verified&rdquo; means
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          When you see a verified badge, it means a team member has personally
          confirmed the listing against its official source. Specifically:
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            The source URL loads and matches the opportunity described
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Key details (dates, eligibility, location) have been confirmed
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            The listing has been reviewed within the current cycle
          </li>
        </ul>
      </section>

      {/* Trust badges */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-foreground">
          Trust indicators
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.color}`}
              >
                <badge.icon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Report an issue */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              See something wrong?
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              If you notice an expired, inaccurate, or suspicious listing,
              please let us know. Community reports help us keep the site
              reliable for everyone.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Use the &ldquo;Report&rdquo; link on any listing page, or reach
              out through our contact form. We review every report promptly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
