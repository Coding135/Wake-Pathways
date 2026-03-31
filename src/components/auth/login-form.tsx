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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({
  redirectNext,
  authError,
}: {
  redirectNext?: string;
  authError?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const next = safeNextPath(redirectNext);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const banner =
    authError === 'auth'
      ? 'That sign-in link was invalid or expired. Try signing in again.'
      : authError === 'confirm'
        ? 'That confirmation link was invalid or expired. Try signing up again or request a new confirmation email.'
        : '';

  const savedHint = next === '/saved';

  async function onSubmit(values: FormValues) {
    setFormError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });
    if (error) {
      setFormError(formatAuthError(error));
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['saved-slugs'] });
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>
          Use your Wake Pathways account to save and compare opportunities.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {savedHint && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
              Sign in to view and manage your saved opportunities.
            </p>
          )}
          {banner && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {banner}
            </p>
          )}
          {formError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="login-email"
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
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/60 bg-muted/20 pt-6">
          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Log in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link
              href={
                redirectNext
                  ? `/signup?next=${encodeURIComponent(redirectNext)}`
                  : '/signup'
              }
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
