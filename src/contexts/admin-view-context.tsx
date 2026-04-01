'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  ADMIN_VIEW_COOKIE_NAME,
  ADMIN_VIEW_COOKIE_VALUE_ON,
  clearAdminViewCookieClient,
  writeAdminViewCookieClient,
} from '@/lib/admin-view/cookie';

type AdminViewContextValue = {
  /** Signed-in user is in REVIEW_MODERATOR_EMAILS (server-verified) */
  canUseAdminToggle: boolean;
  /** Admin View is on (cookie + moderator) */
  adminViewOn: boolean;
  setAdminViewOn: (on: boolean) => void;
  /** Clear preference (e.g. on sign out) */
  clearAdminViewPreference: () => void;
};

const AdminViewContext = createContext<AdminViewContextValue | undefined>(undefined);

export function AdminViewProvider({
  children,
  initialAdminViewOn,
  initialModeratorAccess,
}: {
  children: ReactNode;
  initialAdminViewOn: boolean;
  initialModeratorAccess: boolean;
}) {
  const { user } = useAuth();
  const [moderatorAccess, setModeratorAccess] = useState(initialModeratorAccess);

  const [adminViewOn, setAdminViewOnState] = useState(initialAdminViewOn);
  const prevEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      prevEmailRef.current = null;
      setModeratorAccess(false);
      clearAdminViewCookieClient();
      setAdminViewOnState(false);
      return;
    }

    const switched =
      prevEmailRef.current !== null && prevEmailRef.current !== user.email;
    prevEmailRef.current = user.email;
    if (switched) {
      setModeratorAccess(false);
      clearAdminViewCookieClient();
      setAdminViewOnState(false);
    }

    const ac = new AbortController();
    fetch('/api/admin/access', { credentials: 'same-origin', signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        const ok = res.ok;
        setModeratorAccess(ok);
        if (!ok) {
          clearAdminViewCookieClient();
          setAdminViewOnState(false);
        }
      })
      .catch(() => {
        if (ac.signal.aborted) return;
        setModeratorAccess(false);
        clearAdminViewCookieClient();
        setAdminViewOnState(false);
      });

    return () => ac.abort();
  }, [user?.email]);

  useEffect(() => {
    if (!moderatorAccess || typeof document === 'undefined') return;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${ADMIN_VIEW_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
    );
    const v = match?.[1];
    setAdminViewOnState(v === ADMIN_VIEW_COOKIE_VALUE_ON);
  }, [moderatorAccess]);

  const canUseAdminToggle = moderatorAccess;

  const setAdminViewOn = useCallback(
    (on: boolean) => {
      if (!moderatorAccess) return;
      setAdminViewOnState(on);
      writeAdminViewCookieClient(on);
    },
    [moderatorAccess]
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
