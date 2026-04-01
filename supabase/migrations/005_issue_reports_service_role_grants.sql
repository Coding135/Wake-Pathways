-- Ensure service_role can read/write opportunity_issue_reports after 004.
-- Some environments need explicit schema usage alongside table grants.
-- Safe to run if 004 already applied; no-ops the table grant block if the table is missing yet.

grant usage on schema public to service_role;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_tables
    where schemaname = 'public'
      and tablename = 'opportunity_issue_reports'
  ) then
    execute 'grant select, insert, update, delete on table public.opportunity_issue_reports to service_role';
  end if;
end $$;
