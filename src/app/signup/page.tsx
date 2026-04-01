import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/redirect';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Sign up - Wake Pathways',
  description: 'Create a Wake Pathways account to save opportunities.',
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(safeNextPath(sp.next));
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] min-w-0 max-w-md flex-col justify-center px-3 py-10 sm:px-6 sm:py-12">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        <Link href="/opportunities" className="font-medium text-primary hover:underline">
          ← Back to opportunities
        </Link>
      </p>
      <SignupForm redirectNext={sp.next} />
    </div>
  );
}
