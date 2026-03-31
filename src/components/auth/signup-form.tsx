'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { formatAuthError } from '@/lib/auth/errors';
import { safeNextPath } from '@/lib/auth/redirect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const schema = z.object({
  fullName: z.string().max(120, 'Name is too long').optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

function callbackUrl(next: string) {
  if (typeof window === 'undefined') return '';
  const n = encodeURIComponent(next);
  return `${window.location.origin}/auth/callback?next=${n}`;
}

export function SignupForm({ redirectNext }: { redirectNext?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const next = safeNextPath(redirectNext);
  const savedHint = next === '/saved';
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError('');
    setSuccessMessage('');
    const supabase = createClient();
    const emailRedirectTo = callbackUrl(next);
    const trimmedName = values.fullName?.trim();
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: emailRedirectTo || undefined,
        data: trimmedName ? { full_name: trimmedName } : {},
      },
    });
    if (error) {
      setFormError(formatAuthError(error));
      return;
    }
    if (data.session) {
      await queryClient.invalidateQueries({ queryKey: ['saved-slugs'] });
      router.push(next);
      router.refresh();
      return;
    }
    setSuccessMessage(
      'Check your email for a confirmation link to finish setting up your account.'
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Save opportunities and compare them anytime you sign in.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {savedHint && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
              Create an account to save opportunities and open your Saved list on any device.
            </p>
          )}
          {successMessage && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/45 dark:text-emerald-100">
              {successMessage}
            </p>
          )}
          {formError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="signup-name" className="text-sm font-medium text-foreground">
              Name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input id="signup-name" type="text" autoComplete="name" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/60 bg-muted/20 pt-6">
          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Sign up
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={
                redirectNext
                  ? `/login?next=${encodeURIComponent(redirectNext)}`
                  : '/login'
              }
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
