import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // In production, this would verify admin auth for /admin routes
  // For demo mode, all routes are accessible
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
