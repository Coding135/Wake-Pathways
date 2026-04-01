import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getModeratorUser } from '@/lib/auth/moderator';
import { AdminLayoutInner } from './admin-layout-inner';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const moderator = await getModeratorUser();
  if (!moderator) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
