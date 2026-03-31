'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import { isAdminToggleUser } from '@/lib/auth/admin-toggle';
import {
  ADMIN_VIEW_COOKIE_NAME,
  ADMIN_VIEW_COOKIE_VALUE_ON,
  clearAdminViewCookieClient,
  writeAdminViewCookieClient,
} from '@/lib/admin-view/cookie';

type AdminViewContextValue = {
  /** User may see the Admin View toggle and shortcuts */
  canUseAdminToggle: boolean;
  /** Admin View is on (cookie + allowed user) */
  adminViewOn: boolean;
  setAdminViewOn: (on: boolean) => void;
  /** Clear preference (e.g. on sign out) */
  clearAdminViewPreference: () => void;
};

const AdminViewContext = createContext<AdminViewContextValue | undefined>(undefined);

export function AdminViewProvider({
  children,
  initialAdminViewOn,
}: {
  children: ReactNode;
  initialAdminViewOn: boolean;
}) {
  const { user } = useAuth();
  const canUseAdminToggle = useMemo(() => isAdminToggleUser(user?.email), [user?.email]);

  const [adminViewOn, setAdminViewOnState] = useState(initialAdminViewOn);

  useEffect(() => {
    if (!user?.email || !isAdminToggleUser(user.email)) {
      clearAdminViewCookieClient();
      setAdminViewOnState(false);
      return;
    }
    if (typeof document === 'undefined') return;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${ADMIN_VIEW_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
    );
    const v = match?.[1];
    setAdminViewOnState(v === ADMIN_VIEW_COOKIE_VALUE_ON);
  }, [user?.email]);

  const setAdminViewOn = useCallback(
    (on: boolean) => {
      if (!isAdminToggleUser(user?.email ?? null)) return;
      setAdminViewOnState(on);
      writeAdminViewCookieClient(on);
    },
    [user?.email]
  );

  const clearAdminViewPreference = useCallback(() => {
    clearAdminViewCookieClient();
    setAdminViewOnState(false);
  }, []);

  const value = useMemo(
    () => ({
      canUseAdminToggle,
      adminViewOn: canUseAdminToggle && adminViewOn,
      setAdminViewOn,
      clearAdminViewPreference,
    }),
    [canUseAdminToggle, adminViewOn, setAdminViewOn, clearAdminViewPreference]
  );

  return <AdminViewContext.Provider value={value}>{children}</AdminViewContext.Provider>;
}

export function useAdminView() {
  const ctx = useContext(AdminViewContext);
  if (ctx === undefined) {
    throw new Error('useAdminView must be used within AdminViewProvider');
  }
  return ctx;
}
