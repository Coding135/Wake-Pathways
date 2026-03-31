import Link from 'next/link';
import Image from 'next/image';
import { APP_SHORT_NAME } from '@/lib/constants';
import { BRAND_LOGO_MARK_32 } from '@/lib/brand';

const FOOTER_LINKS = [
  { label: 'Explore', href: '/opportunities' },
  { label: 'Saved', href: '/saved' },
  { label: 'Submit', href: '/submit' },
  { label: 'About', href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Log in', href: '/login' },
  { label: 'Sign up', href: '/signup' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50">
                <Image
                  src={BRAND_LOGO_MARK_32}
                  alt=""
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {APP_SHORT_NAME}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A community resource for Wake County teens to discover real,
              local opportunities.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verify all opportunity details on official source pages. Listings
            are curated in good faith but may change without notice.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} {APP_SHORT_NAME}. Built with
            care for the Wake County community.
          </p>
        </div>
      </div>
    </footer>
  );
}
