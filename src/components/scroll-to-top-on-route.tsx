'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * On client-side navigations to a new route (pathname change), jump the window to the top
 * immediately — no smooth scroll. Query-only updates on the same path (e.g. explore filters)
 * do not scroll.
 */
export function ScrollToTopOnRoute() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prev === null) {
      return;
    }
    if (prev === pathname) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
