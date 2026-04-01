-- Wake Pathways: lightweight listing issue reports (slug-aligned with mock/JSON listings).
-- Inserts go through Next.js API with service role only; no direct client access.
-- Run after 003_opportunity_reviews.sql

-- -----------------------------------------------------------------------------
-- Enum + table
-- -----------------------------------------------------------------------------
create type public.issue_report_status as enum ('open', 'reviewed', 'resolved');

create table public.opportunity_issue_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_slug text not null,
  issue_type text not null check (issue_type in (
    'outdated_information',
    'broken_link',
    'wrong_deadline',
    'incorrect_eligibility',
    'duplicate_listing',
    'no_longer_available',
    'other'
  )),
  description text,
  reporter_user_id uuid references auth.users (id) on delete set null,
  reporter_email text,
  status public.issue_report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_issue_reports_slug on public.opportunity_issue_reports (opportunity_slug);
create index idx_issue_reports_status on public.opportunity_issue_reports (status);
create index idx_issue_reports_created on public.opportunity_issue_reports (created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_opportunity_issue_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_opportunity_issue_reports_updated_at on public.opportunity_issue_reports;
create trigger tr_opportunity_issue_reports_updated_at
  before update on public.opportunity_issue_reports
  for each row execute function public.set_opportunity_issue_reports_updated_at();

-- -----------------------------------------------------------------------------
-- RLS: no policies; service_role bypasses RLS for API routes.
-- -----------------------------------------------------------------------------
alter table public.opportunity_issue_reports enable row level security;

revoke all on table public.opportunity_issue_reports from public;
revoke all on table public.opportunity_issue_reports from anon;
revoke all on table public.opportunity_issue_reports from authenticated;

grant all on table public.opportunity_issue_reports to service_role;

-- -----------------------------------------------------------------------------
-- Moderation: use /api/admin/opportunity-issue-reports with REVIEW_MODERATOR_EMAILS
-- and SUPABASE_SERVICE_ROLE_KEY, or query in Supabase SQL Editor as service role.
-- -----------------------------------------------------------------------------
