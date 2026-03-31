-- Wake Pathways: Supabase Auth profiles + per-user saved opportunity slugs
-- Run after 001_initial_schema.sql (apply via SQL Editor or supabase db push).
-- Replaces legacy saved_opportunities (email + uuid opportunity_id) with user_id + opportunity_slug.

-- -----------------------------------------------------------------------------
-- Drop legacy saved_opportunities (email-based, open RLS). Data loss acceptable for migration to auth users.
-- -----------------------------------------------------------------------------
drop policy if exists "Public can save" on public.saved_opportunities;
drop table if exists public.saved_opportunities;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_email on public.profiles (email);

-- -----------------------------------------------------------------------------
-- Saved opportunities: slug matches app JSON / mock-data slugs (e.g. opp slug string)
-- -----------------------------------------------------------------------------
create table public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_slug)
);

create index idx_saved_opportunities_user on public.saved_opportunities (user_id);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.saved_opportunities enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "saved_select_own"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

create policy "saved_insert_own"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

create policy "saved_delete_own"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, delete on table public.saved_opportunities to authenticated;

-- Keep profile email in sync when auth email changes
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
      set email = new.email, updated_at = now()
      where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();
