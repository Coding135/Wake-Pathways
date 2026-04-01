import { headers } from 'next/headers';

/** Best-effort absolute origin for links in server-rendered pages (Vercel forwards host/proto). */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() ?? h.get('host')?.trim();
  if (!host) return '';
  let proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (!proto) {
    proto = host.startsWith('localhost') ? 'http' : 'https';
  }
  return `${proto}://${host}`;
}

export async function resolveAbsoluteListingUrl(slug: string): Promise<string> {
  let origin = await getRequestOrigin();
  if (!origin && process.env.VERCEL_URL?.trim()) {
    origin = `https://${process.env.VERCEL_URL.trim().replace(/^https?:\/\//, '')}`;
  }
  if (!origin && process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    origin = process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '');
  }
  if (!origin) {
    origin = 'http://localhost:3000';
  }
  return `${origin.replace(/\/$/, '')}/opportunities/${slug}`;
}
