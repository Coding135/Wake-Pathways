-- Add Research to opportunity category enum (Supabase / PostgreSQL).
alter type opportunity_category add value if not exists 'research';
