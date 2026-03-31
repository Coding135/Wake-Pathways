import type { User } from '@supabase/supabase-js';

/** Minimal profile fields needed for display (from `public.profiles` or equivalent). */
export type UserProfileDisplay = {
  full_name: string | null;
} | null;

function normalizeDisplayName(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

/** Reads optional name keys from Supabase Auth `user_metadata` (signup `options.data`, etc.). */
function displayNameFromUserMetadata(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (!meta) return null;
  return (
    normalizeDisplayName(meta.full_name) ??
    normalizeDisplayName(meta.fullName) ??
    normalizeDisplayName(meta.name) ??
    normalizeDisplayName(meta.display_name)
  );
}

/**
 * Single shared label for signed-in UI: header button, dropdown, mobile drawer.
 *
 * Fallback order:
 * 1. `profiles.full_name` (trimmed, non-empty)
 * 2. `user.user_metadata` name fields (trimmed, non-empty)
 * 3. `user.email`
 */
export function getUserDisplayLabel(
  user: User | null | undefined,
  profile?: UserProfileDisplay
): string {
  if (!user?.email) return '';
  const email = user.email.trim();

  const fromProfile = profile ? normalizeDisplayName(profile.full_name) : null;
  if (fromProfile) return fromProfile;

  const fromMetadata = displayNameFromUserMetadata(user);
  if (fromMetadata) return fromMetadata;

  return email;
}

/** First character for avatar chip (uses label if it’s a name, else email). */
export function getUserDisplayInitial(displayLabel: string, email: string): string {
  const source = (displayLabel.trim() || email.trim()) || '';
  return source[0]?.toUpperCase() ?? '?';
}
