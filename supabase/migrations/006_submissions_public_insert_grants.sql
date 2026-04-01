-- Allow the browser/anon Supabase role to INSERT into submissions when the API uses the
-- publishable key without a service role (RLS policy "Public can submit opportunities" must still pass).
-- Service role bypasses RLS and does not rely on these grants.

grant insert on table public.submissions to anon, authenticated;
