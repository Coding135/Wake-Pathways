#!/usr/bin/env node
/**
 * Insert data/pending-ai-submissions-2026-08-10.json into public.submissions.
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (or NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY for insert-only).
 *
 * Usage:
 *   node --env-file=.env.local scripts/insert-pending-ai-submissions.mjs
 *   node --env-file=.env.local scripts/insert-pending-ai-submissions.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry-run');
const file = path.join(__dirname, '../data/pending-ai-submissions-2026-08-10.json');
const payload = JSON.parse(fs.readFileSync(file, 'utf8'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key in env.');
  process.exit(1);
}

const rows = payload.submissions.map((s) => ({
  organization_name: s.organization_name,
  contact_name: s.contact_name,
  contact_email: s.contact_email,
  opportunity_title: s.opportunity_title,
  category: s.category,
  short_summary: s.short_summary,
  full_description: s.full_description,
  eligibility: s.eligibility,
  grades_min: s.grades_min,
  grades_max: s.grades_max,
  age_min: s.age_min,
  age_max: s.age_max,
  location_city: s.location_city,
  remote_type: s.remote_type,
  paid_type: s.paid_type,
  compensation_text: s.compensation_text,
  cost_text: s.cost_text,
  is_free: s.is_free,
  deadline_at: s.deadline_at,
  official_application_url: s.official_application_url,
  supporting_url: s.supporting_url,
  logo_url: null,
  verification_notes: s.verification_notes,
  status: 'pending',
  admin_notes: s.admin_notes,
  reviewed_at: null,
  reviewed_by: null,
}));

console.log(`Prepared ${rows.length} pending submissions (dryRun=${DRY})`);
if (DRY) {
  console.log(JSON.stringify(payload.counts_by_category, null, 2));
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.from('submissions').insert(rows).select('id, opportunity_title');
if (error) {
  console.error('Insert failed:', error);
  process.exit(1);
}
console.log(`Inserted ${data?.length ?? 0} rows`);
for (const row of data ?? []) {
  console.log(`  ${row.id}  ${row.opportunity_title}`);
}
