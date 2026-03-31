'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { formatAuthError } from '@/lib/auth/errors';
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
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError('');
    const supabase = createClient();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo,
    });
    if (error) {
      setFormError(formatAuthError(error));
      return;
    }
    setSent(true);
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to choose a new password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {sent && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              If an account exists for that email, you&apos;ll receive reset instructions shortly.
            </p>
          )}
          {formError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              disabled={sent}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/60 bg-muted/20 pt-6">
          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting || sent}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
