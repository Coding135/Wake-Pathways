'use client';

import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100',
          side === 'top' && 'bottom-full mb-2',
          side === 'bottom' && 'top-full mt-2'
        )}
      >
        {content}
      </span>
    </span>
  );
}

export { Tooltip };
