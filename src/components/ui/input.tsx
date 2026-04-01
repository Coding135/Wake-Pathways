'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-base text-foreground transition-colors duration-150 sm:h-10 sm:text-sm dark:bg-card',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
        'disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        error
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-input',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
