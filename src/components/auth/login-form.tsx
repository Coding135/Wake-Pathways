'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatAuthError } from '@/lib/auth/errors';
import { safeNextPath } from '@/lib/auth/redirect';
import { cn } from '@/lib/utils';
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

function callbackUrl(next: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 shrink-0', className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const LOGIN_FORM_ID = 'login-email-form';

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
  const [oauthLoading, setOauthLoading] = useState(false);
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

  async function signInWithGoogle() {
    setFormError('');
    setOauthLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl(next),
      },
    });
    if (error) {
      setFormError(formatAuthError(error));
      setOauthLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>
          Use your Wake Pathways account to save and compare opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedHint && (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
            Sign in to view and manage your saved opportunities.
          </p>
        )}
        {banner && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/45 dark:text-amber-100">
            {banner}
          </p>
        )}
        {formError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-3 border-border bg-background text-[15px] font-medium shadow-sm hover:bg-muted/60 dark:hover:bg-secondary"
          onClick={() => void signInWithGoogle()}
          disabled={oauthLoading || isSubmitting}
        >
          {oauthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <GoogleMark />
          )}
          Continue with Google
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs font-medium">
            <span className="bg-card px-3 text-muted-foreground">or log in with email</span>
          </div>
        </div>

        <form id={LOGIN_FORM_ID} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border/60 bg-muted/20 pt-6">
        <Button
          type="submit"
          form={LOGIN_FORM_ID}
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting || oauthLoading}
        >
          Log in with email
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
    </Card>
  );
}
