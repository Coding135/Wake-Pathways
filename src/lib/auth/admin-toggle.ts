/**
 * Emails allowed to see the Admin View UI toggle (navigation convenience only).
 * Server-side admin APIs/pages must still enforce real authorization.
 */
const ADMIN_TOGGLE_EMAILS_LOWER = new Set([
  'singhparth.del@gmail.com',
  'wakepathways@gmail.com',
]);

export function normalizeEmailForAdminToggle(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminToggleUser(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return ADMIN_TOGGLE_EMAILS_LOWER.has(normalizeEmailForAdminToggle(email));
}
