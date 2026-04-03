import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_SHORT_NAME } from '@/lib/constants';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Privacy Policy - ${APP_SHORT_NAME}`,
  description: `How ${APP_SHORT_NAME} collects, uses, and protects your information.`,
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {APP_SHORT_NAME}
          {' '}
          is built for Wake County teens, families, schools, and counselors. This page
          explains, in plain language, what information we collect, why we collect it, and what you can
          do about it. We keep this policy short on purpose.
        </p>
      </header>

      <div className="space-y-10">
        <Section title="What we collect">
          <p>
            <strong className="text-foreground">Account information.</strong> If you create an account, we
            collect the details you provide, such as your email address and password (stored securely by our
            auth provider). You may optionally add a display name.
          </p>
          <p>
            <strong className="text-foreground">Saved opportunities.</strong> When you save listings, we
            store which opportunities are linked to your account so you can view them on your Saved page.
          </p>
          <p>
            <strong className="text-foreground">Technical data.</strong> Like most websites, our servers
            receive basic technical information when you use the site (for example, IP address and browser
            type) as part of normal operation. We do not use third-party advertising or analytics trackers in
            the product today. If that changes, we will update this page.
          </p>
        </Section>

        <Section title="Cookies and similar technologies">
          <p>
            We use cookies and similar storage as needed to keep you signed in, protect your account, and
            make the site work. Essential session cookies are set by our authentication service when you log
            in. You can control cookies through your browser settings, but some features may not work without
            them.
          </p>
        </Section>

        <Section title="How we use your information">
          <ul className="list-disc space-y-2 pl-5">
            <li>To create and maintain your account</li>
            <li>To let you save, view, and compare opportunities</li>
            <li>To send essential emails about your account (for example, sign-up confirmation or password reset), delivered through our authentication provider</li>
            <li>To keep the site secure and fix problems</li>
            <li>To improve {APP_SHORT_NAME} over time in ways that match why the site exists</li>
          </ul>
        </Section>

        <Section title="Third-party services">
          <p>
            We rely on trusted vendors to run {APP_SHORT_NAME}. Today that includes{' '}
            <strong className="text-foreground">Supabase</strong> for user accounts, database storage (including
            saved opportunities and profile fields), and auth-related email delivery. The public website is built
            with <strong className="text-foreground">Next.js</strong> and is hosted on industry-standard cloud
            infrastructure so it is available on the web. Those providers process data only as needed to
            perform their role. Their own privacy policies also apply.
          </p>
        </Section>

        <Section title="Teens, students, and families">
          <p>
            {APP_SHORT_NAME}
            {' '}
            is meant for high school students and others looking for local opportunities. We
            do not ask for more personal information than we need to run accounts and saved listings. We are
            not providing legal advice on this page.
          </p>
          <p>
            If you are a parent or guardian and believe a young person&apos;s personal information was
            submitted inappropriately, or you want it reviewed or deleted, please contact us using the email
            below. We will work with you in good faith.
          </p>
        </Section>

        <Section title="Selling and sharing">
          <p>
            We <strong className="text-foreground">do not sell</strong> your personal information. We share
            it only with service providers who help us operate the site (such as authentication and
            database hosting), under agreements that limit how they may use it.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We take reasonable steps to protect information, including secure connections and reputable
            infrastructure. No method of transmission or storage is perfectly secure, but we work to reduce
            risk and to follow common practices for a small web application.
          </p>
        </Section>

        <Section title="Your choices">
          <p>
            You may ask to access, correct, or delete your account and related data. You can also contact us
            with any privacy question. We will respond when we can and may need to verify your identity
            before changing account data.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Privacy questions or requests:{' '}
            <a
              href="mailto:wakepathways@gmail.com"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              wakepathways@gmail.com
            </a>
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update this policy from time to time. When we do, we will change the &quot;Last
            updated&quot; date at the top. Please check back occasionally, especially if you use an account.
          </p>
        </Section>
      </div>

      <p className="mt-14 text-center">
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'gap-1')}>
          Back to home
        </Link>
      </p>
    </div>
  );
}
