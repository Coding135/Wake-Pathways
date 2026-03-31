import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Reset password — Wake Pathways',
  description: 'Set a new password for your Wake Pathways account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Back to log in
        </Link>
      </p>
      <ResetPasswordForm />
    </div>
  );
}
