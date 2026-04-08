-- General site feedback (not tied to a listing). Inserts via Next.js API + service role only.

create table public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) <= 4000),
  contact_email text,
  reporter_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_site_feedback_created on public.site_feedback (created_at desc);

alter table public.site_feedback enable row level security;

revoke all on table public.site_feedback from public;
revoke all on table public.site_feedback from anon;
revoke all on table public.site_feedback from authenticated;

grant all on table public.site_feedback to service_role;
