import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/layout/header';
import { AuthConfigBanner } from '@/components/layout/auth-config-banner';
import { Footer } from '@/components/layout/footer';
import { cookies } from 'next/headers';
import { Providers } from '@/components/providers';
import { createClient } from '@/lib/supabase/server';
import { THEME_INIT_SCRIPT } from '@/lib/theme-storage';
import { isModeratorEmail } from '@/lib/auth/moderator';
import {
  ADMIN_VIEW_COOKIE_NAME,
  ADMIN_VIEW_COOKIE_VALUE_ON,
} from '@/lib/admin-view/cookie';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wake Pathways - Opportunities for Wake County Teens',
  description:
    'Discover real internships, volunteer roles, scholarships, and programs for teens in Wake County, NC.',
  icons: {
    icon: [{ url: '/brand/logo-mark-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/brand/logo-mark-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: { full_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    initialProfile = data ?? null;
  }

  const cookieStore = await cookies();
  const adminViewCookieOn =
    cookieStore.get(ADMIN_VIEW_COOKIE_NAME)?.value === ADMIN_VIEW_COOKIE_VALUE_ON;
  const initialModeratorAccess = isModeratorEmail(user?.email ?? null);
  const initialAdminViewOn = Boolean(initialModeratorAccess && adminViewCookieOn);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="auto"
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <Providers
          initialUser={user}
          initialProfile={initialProfile}
          initialAdminViewOn={initialAdminViewOn}
          initialModeratorAccess={initialModeratorAccess}
        >
          <AuthConfigBanner />
          <Header />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
