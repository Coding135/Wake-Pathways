import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Skip static/image optimization, crawlers, well-known, favicon, and raster/font files.
     * Do not exclude all of /_next/ or *.json — RSC uses /_next/data/*.json and needs middleware.
     */
    '/((?!_next/static|_next/image|\\.well-known/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
