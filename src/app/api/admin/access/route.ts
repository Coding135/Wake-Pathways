import { NextResponse } from 'next/server';
import { getModeratorUser } from '@/lib/auth/moderator';

export const dynamic = 'force-dynamic';

/**
 * Lightweight session probe: 204 if the current user is in REVIEW_MODERATOR_EMAILS, else 404.
 * Used client-side to show admin nav; does not expose allowlist contents.
 */
export async function GET() {
  const mod = await getModeratorUser();
  if (!mod) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
