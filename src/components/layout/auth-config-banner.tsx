'use client';

/**
 * Visible hint when the client bundle was built without Supabase public env.
 * NEXT_PUBLIC_* must be present at build time on Vercel for auth to work in production.
 */
export function AuthConfigBanner() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && key) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950 sm:text-sm dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-100">
      <strong className="font-semibold">Auth is not configured in this build.</strong> Add{' '}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/60 dark:text-amber-50">
        NEXT_PUBLIC_SUPABASE_URL
      </code>{' '}
      and{' '}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/60 dark:text-amber-50">
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      </code>{' '}
      (or legacy{' '}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/60 dark:text-amber-50">
        NEXT_PUBLIC_SUPABASE_ANON_KEY
      </code>
      ) in Vercel, then redeploy.
    </div>
  );
}
