import Link from 'next/link';
import { MapPin, ArrowLeft, Search } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <MapPin className="h-10 w-10 text-primary" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
        We couldn&rsquo;t find what you were looking for. The page may have
        moved, or the link might be outdated.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), 'gap-2')}>
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link href="/opportunities" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
          <Search className="h-4 w-4" />
          Browse opportunities
        </Link>
      </div>
    </div>
  );
}
