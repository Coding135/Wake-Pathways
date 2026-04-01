'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function HeroSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/opportunities?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/opportunities');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl min-w-0">
      <div className="flex flex-col gap-2 sm:relative sm:block">
        <div className="relative min-w-0 w-full">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-4"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internships, scholarships, programs..."
            className="h-12 w-full min-w-0 rounded-2xl border border-border bg-white py-2 pl-11 pr-4 text-base text-foreground shadow-[0_4px_24px_-6px_rgb(15_23_42/0.08)] placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-[var(--ring-offset)] transition-all dark:bg-card dark:shadow-[0_2px_12px_-4px_rgb(0_0_0/0.45)] sm:h-14 sm:pl-12 sm:pr-28 touch-manipulation"
            aria-label="Search opportunities"
          />
        </div>
        <button
          type="submit"
          className="h-11 w-full shrink-0 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] sm:absolute sm:right-2 sm:top-1/2 sm:h-10 sm:w-auto sm:-translate-y-1/2 touch-manipulation"
        >
          Search
        </button>
      </div>
    </form>
  );
}
