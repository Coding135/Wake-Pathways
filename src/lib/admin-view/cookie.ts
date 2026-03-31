/** Client-readable cookie for Admin View UI preference (not a security boundary). */
export const ADMIN_VIEW_COOKIE_NAME = 'wakepathways_admin_view';
export const ADMIN_VIEW_COOKIE_VALUE_ON = '1';

/** ~400 days — stays on until user turns off or signs out */
export const ADMIN_VIEW_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 400;

export function isAdminViewCookieOn(value: string | undefined | null): boolean {
  return value === ADMIN_VIEW_COOKIE_VALUE_ON;
}

/** Build Set-Cookie style fragment for document.cookie (browser only). */
export function buildAdminViewCookieHeader(on: boolean): string {
  if (!on) {
    return `${ADMIN_VIEW_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  return `${ADMIN_VIEW_COOKIE_NAME}=${ADMIN_VIEW_COOKIE_VALUE_ON}; path=/; max-age=${ADMIN_VIEW_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function writeAdminViewCookieClient(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.cookie = buildAdminViewCookieHeader(on);
}

export function clearAdminViewCookieClient(): void {
  writeAdminViewCookieClient(false);
}
