#!/usr/bin/env npx tsx

/**
 * Link verification script for Wake Youth Hub opportunities.
 *
 * Usage:
 *   npx tsx scripts/verify-links.ts            # Check all links with HTTP requests
 *   npx tsx scripts/verify-links.ts --dry-run   # Report-only, no HTTP requests
 */

import { resolve } from 'node:path';

// Scripts can't use @/ aliases - inline the types we need and dynamically
// load mock data via tsx's ESM/TS resolution.

interface Opportunity {
  id: string;
  slug: string;
  title: string;
  source_url: string | null;
  official_application_url: string | null;
  deadline_at: string | null;
  deadline_type: string;
  last_verified_at: string | null;
  verification_status: string;
  verified: boolean;
  is_active: boolean;
  organization_id: string | null;
  category: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STALE_THRESHOLD_DAYS = 30;
const REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function isPast(date: string): boolean {
  return new Date(date) < new Date();
}

function isStale(lastVerified: string | null): boolean {
  if (!lastVerified) return true;
  return daysBetween(new Date(lastVerified), new Date()) > STALE_THRESHOLD_DAYS;
}

interface CheckResult {
  url: string;
  field: 'source_url' | 'official_application_url';
  status: 'ok' | 'failed' | 'skipped' | 'blocked';
  httpStatus?: number;
  error?: string;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  async function attempt(method: 'HEAD' | 'GET'): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, {
        method,
        signal: controller.signal,
        redirect: 'follow',
        ...(method === 'GET'
          ? { headers: { Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8' } }
          : {}),
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    const res = await attempt('HEAD');
    if (res.ok) return { ok: true, status: res.status };
    // Many sites block HEAD but serve GET (403/405); retry for a fair check.
    if (res.status === 403 || res.status === 405 || res.status === 501) {
      const res2 = await attempt('GET');
      if (res2.ok || res2.status === 206) return { ok: true, status: res2.status };
      return { ok: false, status: res2.status };
    }
    return { ok: false, status: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const res2 = await attempt('GET');
      if (res2.ok || res2.status === 206) return { ok: true, status: res2.status };
      return { ok: false, status: res2.status, error: message };
    } catch {
      return { ok: false, error: message };
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Wake Youth Hub - Link Verification Report          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (DRY_RUN) {
    console.log('  Mode: DRY RUN (no HTTP requests will be made)\n');
  } else {
    console.log('  Mode: LIVE (HEAD then GET fallback; 403 = blocked bots, not always a dead link)\n');
  }

  // Dynamically import mock data (works with tsx)
  const mockDataPath = resolve(__dirname, '../src/lib/mock-data.ts');
  let opportunities: Opportunity[];
  try {
    const mod = await import(mockDataPath);
    opportunities = mod.MOCK_OPPORTUNITIES;
  } catch {
    console.error('  ✗ Could not load mock data. Make sure src/lib/mock-data.ts exists.');
    process.exit(1);
  }

  console.log(`  Total opportunities loaded: ${opportunities.length}\n`);

  // Counters
  let totalChecked = 0;
  let okCount = 0;
  let failedCount = 0;
  let blockedCount = 0;
  let skippedCount = 0;

  const issues: string[] = [];
  const results: { opportunity: string; checks: CheckResult[] }[] = [];

  for (const opp of opportunities) {
    const oppResults: CheckResult[] = [];
    const urls: { url: string | null; field: 'source_url' | 'official_application_url' }[] = [
      { url: opp.source_url, field: 'source_url' },
      { url: opp.official_application_url, field: 'official_application_url' },
    ];

    // Flag issues regardless of URL checking
    if (opp.deadline_at && isPast(opp.deadline_at) && opp.is_active) {
      issues.push(`⚠ "${opp.title}" has an expired deadline (${opp.deadline_at})`);
    }

    if (!opp.official_application_url) {
      issues.push(`⚠ "${opp.title}" is missing official_application_url`);
    }

    if (isStale(opp.last_verified_at)) {
      const age = opp.last_verified_at
        ? `${daysBetween(new Date(opp.last_verified_at), new Date())} days ago`
        : 'never';
      issues.push(`⚠ "${opp.title}" has stale verification (last checked: ${age})`);
    }

    for (const { url, field } of urls) {
      if (!url) {
        skippedCount++;
        oppResults.push({ url: '(none)', field, status: 'skipped' });
        continue;
      }

      totalChecked++;

      if (DRY_RUN) {
        okCount++;
        oppResults.push({ url, field, status: 'ok' });
        continue;
      }

      const result = await checkUrl(url);
      if (result.ok) {
        okCount++;
        oppResults.push({ url, field, status: 'ok', httpStatus: result.status });
      } else if (result.status === 403) {
        blockedCount++;
        oppResults.push({
          url,
          field,
          status: 'blocked',
          httpStatus: 403,
          error: 'HTTP 403 (often bot protection; confirm in a browser)',
        });
      } else {
        failedCount++;
        const reason = result.error ?? `HTTP ${result.status}`;
        oppResults.push({ url, field, status: 'failed', httpStatus: result.status, error: reason });
      }
    }

    results.push({ opportunity: opp.title, checks: oppResults });
  }

  // ---------------------------------------------------------------------------
  // Print per-opportunity detail
  // ---------------------------------------------------------------------------
  console.log('─── Per-Opportunity Results ───────────────────────────────────\n');

  for (const r of results) {
    const icon = r.checks.some((c) => c.status === 'failed')
      ? '✗'
      : r.checks.some((c) => c.status === 'blocked')
        ? '!'
        : '✓';
    console.log(`  ${icon} ${r.opportunity}`);

    for (const c of r.checks) {
      const label = c.field === 'source_url' ? 'Source' : 'Apply ';
      if (c.status === 'skipped') {
        console.log(`      ${label}: (not set)`);
      } else if (c.status === 'ok') {
        const code = c.httpStatus ? ` [${c.httpStatus}]` : '';
        console.log(`      ${label}: ✓ ${c.url}${code}`);
      } else if (c.status === 'blocked') {
        console.log(`      ${label}: ⚠ ${c.url} - ${c.error}`);
      } else {
        console.log(`      ${label}: ✗ ${c.url} - ${c.error}`);
      }
    }
    console.log('');
  }

  // ---------------------------------------------------------------------------
  // Print issues
  // ---------------------------------------------------------------------------
  if (issues.length > 0) {
    console.log('─── Issues Found ─────────────────────────────────────────────\n');
    for (const issue of issues) {
      console.log(`  ${issue}`);
    }
    console.log('');
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('─── Summary ──────────────────────────────────────────────────\n');
  console.log(`  Opportunities scanned:  ${opportunities.length}`);
  console.log(`  URLs checked:           ${totalChecked}`);
  console.log(`  OK:                     ${okCount}`);
  console.log(`  Failed:                 ${failedCount}`);
  console.log(`  Blocked (403):          ${blockedCount}`);
  console.log(`  Skipped (no URL):       ${skippedCount}`);
  console.log(`  Issues flagged:         ${issues.length}`);
  console.log('');

  if (failedCount > 0) {
    console.log('  ⚠ Some URLs failed verification. Review results above.\n');
    process.exit(1);
  } else {
    console.log(
      blockedCount > 0
        ? '  ✓ No definite failures. Some URLs returned 403 to automated checks; open those in a browser to confirm.\n'
        : '  ✓ All checked URLs are OK.\n'
    );
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
