'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { formatAuthError } from '@/lib/auth/errors';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  async function onSubmit(values: FormValues) {
    setFormError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(formatAuthError(error));
      return;
    }
    router.push('/opportunities');
    router.refresh();
  }

  if (hasSession === null) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Checking your session…
        </CardContent>
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Link expired</CardTitle>
          <CardDescription>
            Open the reset link from your email again, or request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/forgot-password"
            className={cn(buttonVariants({ size: 'default' }), 'w-full justify-center')}
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        <CardDescription>Enter and confirm your new password below.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="reset-password" className="text-sm font-medium text-foreground">
              New password
            </label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="reset-confirm" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirm}
              {...register('confirm')}
            />
            {errors.confirm && (
              <p className="text-sm text-destructive">{errors.confirm.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/60 bg-muted/20 pt-6">
          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
