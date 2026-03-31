-- Wake County Youth Opportunity Hub - Initial Schema
-- PostgreSQL migration for Supabase

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

create type opportunity_category as enum (
  'internship', 'volunteer', 'scholarship', 'summer_program',
  'competition', 'leadership', 'job', 'mentorship', 'other'
);

create type remote_type as enum ('in_person', 'remote', 'hybrid');
create type paid_type as enum ('paid', 'unpaid', 'stipend', 'varies');
create type deadline_type as enum ('fixed', 'rolling', 'none');
create type application_status as enum ('open', 'closing_soon', 'rolling', 'closed');
create type verification_status as enum ('verified', 'pending', 'needs_review', 'failed', 'unverified');
create type submission_status as enum ('pending', 'approved', 'rejected', 'needs_edits');
create type source_type as enum ('official', 'community', 'scraped', 'manual', 'csv_import');

-- =============================================================================
-- TABLES
-- =============================================================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  website text,
  description text,
  logo_url text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  organization_id uuid references organizations(id) on delete set null,
  category opportunity_category not null default 'other',
  short_summary text,
  full_description text,
  eligibility text,
  grades_min integer check (grades_min >= 6 and grades_min <= 12),
  grades_max integer check (grades_max >= 6 and grades_max <= 12),
  age_min integer check (age_min >= 10 and age_min <= 22),
  age_max integer check (age_max >= 10 and age_max <= 22),
  location_city text,
  location_county text default 'Wake',
  remote_type remote_type default 'in_person',
  paid_type paid_type default 'unpaid',
  compensation_text text,
  cost_text text,
  is_free boolean default true,
  deadline_type deadline_type default 'none',
  deadline_at timestamptz,
  application_status application_status default 'open',
  official_application_url text,
  source_url text,
  source_name text,
  source_type source_type default 'manual',
  verified boolean default false,
  verification_status verification_status default 'unverified',
  last_verified_at timestamptz,
  featured boolean default false,
  is_active boolean default true,
  time_commitment text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table submissions (
  id uuid primary key default uuid_generate_v4(),
  organization_name text not null,
  contact_name text,
  contact_email text not null,
  opportunity_title text not null,
  category opportunity_category not null default 'other',
  short_summary text,
  full_description text,
  eligibility text,
  grades_min integer,
  grades_max integer,
  age_min integer,
  age_max integer,
  location_city text,
  remote_type remote_type default 'in_person',
  paid_type paid_type default 'unpaid',
  compensation_text text,
  cost_text text,
  is_free boolean default true,
  deadline_at timestamptz,
  official_application_url text,
  supporting_url text,
  logo_url text,
  verification_notes text,
  status submission_status default 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table verification_logs (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  checked_at timestamptz default now(),
  source_url_status integer,
  application_url_status integer,
  source_url_ok boolean default false,
  application_url_ok boolean default false,
  notes text,
  auto_check boolean default true
);

create table digest_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  interests text[] default '{}',
  is_active boolean default true,
  confirmed boolean default false,
  created_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create table admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

create table saved_opportunities (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  opportunity_id uuid references opportunities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_email, opportunity_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_opportunities_category on opportunities(category);
create index idx_opportunities_active on opportunities(is_active);
create index idx_opportunities_featured on opportunities(featured);
create index idx_opportunities_deadline on opportunities(deadline_at);
create index idx_opportunities_status on opportunities(application_status);
create index idx_opportunities_verified on opportunities(verified);
create index idx_opportunities_slug on opportunities(slug);
create index idx_organizations_slug on organizations(slug);
create index idx_submissions_status on submissions(status);
create index idx_digest_subscribers_email on digest_subscribers(email);
create index idx_verification_logs_opportunity on verification_logs(opportunity_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_opportunities_updated_at before update on opportunities
  for each row execute function update_updated_at_column();
create trigger update_organizations_updated_at before update on organizations
  for each row execute function update_updated_at_column();
create trigger update_submissions_updated_at before update on submissions
  for each row execute function update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table opportunities enable row level security;
alter table organizations enable row level security;
alter table submissions enable row level security;
alter table verification_logs enable row level security;
alter table digest_subscribers enable row level security;
alter table admin_users enable row level security;
alter table saved_opportunities enable row level security;

create policy "Public can view active opportunities" on opportunities
  for select using (is_active = true);

create policy "Public can view organizations" on organizations
  for select using (true);

create policy "Public can submit opportunities" on submissions
  for insert with check (true);

create policy "Public can subscribe" on digest_subscribers
  for insert with check (true);

create policy "Public can save" on saved_opportunities
  for all using (true);
