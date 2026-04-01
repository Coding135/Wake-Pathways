import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Reset password - Wake Pathways',
  description: 'Set a new password for your Wake Pathways account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] min-w-0 max-w-md flex-col justify-center px-3 py-10 sm:px-6 sm:py-12">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Back to log in
        </Link>
      </p>
      <ResetPasswordForm />
    </div>
  );
}
