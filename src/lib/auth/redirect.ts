/**
 * Only allow same-origin relative paths for post-auth redirects (open redirect hardening).
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return '/opportunities';
  const t = next.trim();
  if (!t.startsWith('/') || t.startsWith('//') || t.includes('\0')) return '/opportunities';
  return t;
}
