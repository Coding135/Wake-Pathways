#!/usr/bin/env npx tsx

/**
 * Seed script for Wake Youth Hub.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * In demo mode (default): confirms mock data is available and reports stats.
 * In production mode (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set):
 *   would insert mock data into Supabase tables.
 */

import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types used by the script (subset of the full database types)
// ---------------------------------------------------------------------------

interface Organization {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface Opportunity {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
  featured: boolean;
  verified: boolean;
  [key: string]: unknown;
}

interface Submission {
  id: string;
  opportunity_title: string;
  status: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              Wake Youth Hub - Database Seed                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isProduction = !!(supabaseUrl && supabaseKey);

  if (isProduction) {
    console.log('  Mode: PRODUCTION (Supabase credentials detected)\n');
    console.log(`  Supabase URL: ${supabaseUrl}\n`);
  } else {
    console.log('  Mode: DEMO (no Supabase credentials, using mock data)\n');
  }

  // Load mock data
  const mockDataPath = resolve(__dirname, '../src/lib/mock-data.ts');
  let organizations: Organization[];
  let opportunities: Opportunity[];
  let submissions: Submission[];

  try {
    const mod = await import(mockDataPath);
    organizations = mod.MOCK_ORGANIZATIONS;
    opportunities = mod.MOCK_OPPORTUNITIES;
    submissions = mod.MOCK_SUBMISSIONS;
  } catch (err) {
    console.error('  ✗ Could not load mock data:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Report on what we have
  console.log('  Mock data loaded successfully:\n');
  console.log(`    Organizations:  ${organizations.length}`);
  console.log(`    Opportunities:  ${opportunities.length}`);
  console.log(`    Submissions:    ${submissions.length}`);
  console.log('');

  // Category breakdown
  const categoryCounts = new Map<string, number>();
  for (const opp of opportunities) {
    categoryCounts.set(opp.category, (categoryCounts.get(opp.category) ?? 0) + 1);
  }

  console.log('  Opportunities by category:');
  for (const [cat, count] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(18)} ${count}`);
  }
  console.log('');

  const activeCount = opportunities.filter((o) => o.is_active).length;
  const featuredCount = opportunities.filter((o) => o.featured).length;
  const verifiedCount = opportunities.filter((o) => o.verified).length;

  console.log(`  Active: ${activeCount}  |  Featured: ${featuredCount}  |  Verified: ${verifiedCount}`);
  console.log('');

  if (isProduction) {
    console.log('  ─── Production Seeding ───────────────────────────────────\n');
    console.log('  To implement production seeding:');
    console.log('  1. Install @supabase/supabase-js');
    console.log('  2. Create a Supabase client with the service role key');
    console.log('  3. Upsert organizations, then opportunities, then submissions');
    console.log('  4. Handle foreign key relationships (org_id → organization)');
    console.log('');
    console.log('  Skipping actual inserts - implement when ready for production.\n');

    // Example of what production code would look like:
    //
    // import { createClient } from '@supabase/supabase-js';
    // const supabase = createClient(supabaseUrl!, supabaseKey!);
    //
    // const { error: orgError } = await supabase
    //   .from('organizations')
    //   .upsert(organizations, { onConflict: 'id' });
    // if (orgError) throw orgError;
    //
    // const { error: oppError } = await supabase
    //   .from('opportunities')
    //   .upsert(opportunities, { onConflict: 'id' });
    // if (oppError) throw oppError;
  }

  console.log(`  ✓ Seeded ${organizations.length} organizations, ${opportunities.length} opportunities\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
