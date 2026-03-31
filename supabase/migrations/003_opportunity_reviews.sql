-- Wake Pathways: student reviews / testimonials per opportunity (slug-aligned with app JSON).
-- Moderation: pending -> approved | rejected. Only approved are public to anonymous users.
-- Run after 002_auth_profiles_user_saved.sql

-- -----------------------------------------------------------------------------
-- Enum + table
-- -----------------------------------------------------------------------------
create type public.review_moderation_status as enum ('pending', 'approved', 'rejected');

create table public.opportunity_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_slug text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  display_name text not null,
  graduation_year smallint check (graduation_year is null or (graduation_year >= 2000 and graduation_year <= 2100)),
  grade_level smallint check (grade_level is null or (grade_level >= 6 and grade_level <= 12)),
  participated boolean not null default false,
  would_recommend boolean,
  status public.review_moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_slug)
);

create index idx_opportunity_reviews_slug on public.opportunity_reviews (opportunity_slug);
create index idx_opportunity_reviews_status on public.opportunity_reviews (status);
create index idx_opportunity_reviews_created on public.opportunity_reviews (created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_opportunity_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_opportunity_reviews_updated_at on public.opportunity_reviews;
create trigger tr_opportunity_reviews_updated_at
  before update on public.opportunity_reviews
  for each row execute function public.set_opportunity_reviews_updated_at();

-- -----------------------------------------------------------------------------
-- RLS: public reads approved; authors read their own row (any status)
-- Authors insert only as pending; authors update only to pending (re-moderation after edit)
-- -----------------------------------------------------------------------------
alter table public.opportunity_reviews enable row level security;

create policy "reviews_select_public_or_own"
  on public.opportunity_reviews for select
  using (
    status = 'approved'
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "reviews_insert_own_pending"
  on public.opportunity_reviews for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

create policy "reviews_update_own_requeue"
  on public.opportunity_reviews for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

create policy "reviews_delete_own"
  on public.opportunity_reviews for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Flags (moderators read via service role / SQL editor)
-- -----------------------------------------------------------------------------
create table public.opportunity_review_flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.opportunity_reviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

create index idx_review_flags_review on public.opportunity_review_flags (review_id);

alter table public.opportunity_review_flags enable row level security;

-- Cannot flag your own review; must be signed in
create policy "review_flags_insert_not_own"
  on public.opportunity_review_flags for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.opportunity_reviews r
      where r.id = review_id
        and r.user_id <> auth.uid()
        and r.status = 'approved'
    )
  );

create policy "review_flags_no_select"
  on public.opportunity_review_flags for select
  using (false);

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant select on public.opportunity_reviews to anon, authenticated;
grant insert, update, delete on public.opportunity_reviews to authenticated;

grant insert on public.opportunity_review_flags to authenticated;

-- -----------------------------------------------------------------------------
-- Moderation notes (run in Supabase SQL as service role / dashboard):
--   select * from opportunity_reviews where status = 'pending' order by created_at;
--   update opportunity_reviews set status = 'approved' where id = '...';
-- Or use the in-app /api/admin/opportunity-reviews route with REVIEW_MODERATOR_EMAILS + SUPABASE_SERVICE_ROLE_KEY.
-- -----------------------------------------------------------------------------
