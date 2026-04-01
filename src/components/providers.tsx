'use client';

import { useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AdminViewProvider } from '@/contexts/admin-view-context';
import type { UserProfileDisplay } from '@/lib/auth/user-display';

export function Providers({
  children,
  initialUser,
  initialProfile,
  initialAdminViewOn,
  initialModeratorAccess,
}: {
  children: ReactNode;
  initialUser: User | null;
  initialProfile: UserProfileDisplay;
  initialAdminViewOn: boolean;
  initialModeratorAccess: boolean;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
          <AdminViewProvider
            initialAdminViewOn={initialAdminViewOn}
            initialModeratorAccess={initialModeratorAccess}
          >
            {children}
          </AdminViewProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
