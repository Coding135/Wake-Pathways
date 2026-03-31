import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';
import type { VerificationLog } from '@/types/database';

export const dynamic = 'force-dynamic';

interface VerificationEntry {
  opportunity_id: string;
  opportunity_title: string;
  slug: string;
  source_url: string | null;
  source_url_ok: boolean;
  source_url_status: number | null;
  application_url: string | null;
  application_url_ok: boolean;
  application_url_status: number | null;
  issues: string[];
}

export async function POST() {
  try {
    const now = new Date();
    const entries: VerificationEntry[] = [];
    const logs: Omit<VerificationLog, 'id'>[] = [];

    let totalChecked = 0;
    let okCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const issuesList: string[] = [];

    for (const opp of MOCK_OPPORTUNITIES) {
      if (!opp.is_active) continue;

      const issues: string[] = [];
      let sourceOk = true;
      let appOk = true;

      // Simulate source_url check
      if (opp.source_url) {
        totalChecked++;
        sourceOk = simulateUrlCheck(opp.source_url);
        if (sourceOk) okCount++;
        else {
          failedCount++;
          issues.push(`source_url may be unreachable: ${opp.source_url}`);
        }
      } else {
        skippedCount++;
      }

      // Simulate application_url check
      if (opp.official_application_url) {
        totalChecked++;
        appOk = simulateUrlCheck(opp.official_application_url);
        if (appOk) okCount++;
        else {
          failedCount++;
          issues.push(`official_application_url may be unreachable: ${opp.official_application_url}`);
        }
      } else {
        skippedCount++;
        issues.push('Missing official_application_url');
      }

      // Check deadline
      if (opp.deadline_at && new Date(opp.deadline_at) < now) {
        issues.push(`Deadline has passed: ${opp.deadline_at}`);
      }

      // Check stale verification
      if (opp.last_verified_at) {
        const daysSince = Math.floor(
          (now.getTime() - new Date(opp.last_verified_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince > 30) {
          issues.push(`Stale verification: last checked ${daysSince} days ago`);
        }
      } else {
        issues.push('Never verified');
      }

      issuesList.push(...issues.map((i) => `[${opp.slug}] ${i}`));

      entries.push({
        opportunity_id: opp.id,
        opportunity_title: opp.title,
        slug: opp.slug,
        source_url: opp.source_url,
        source_url_ok: sourceOk,
        source_url_status: opp.source_url ? (sourceOk ? 200 : 0) : null,
        application_url: opp.official_application_url,
        application_url_ok: appOk,
        application_url_status: opp.official_application_url ? (appOk ? 200 : 0) : null,
        issues,
      });

      logs.push({
        opportunity_id: opp.id,
        checked_at: now.toISOString(),
        source_url_status: opp.source_url ? (sourceOk ? 200 : 0) : null,
        application_url_status: opp.official_application_url ? (appOk ? 200 : 0) : null,
        source_url_ok: sourceOk,
        application_url_ok: appOk,
        notes: issues.length > 0 ? issues.join('; ') : null,
        auto_check: true,
      });
    }

    return Response.json({
      report: {
        checked_at: now.toISOString(),
        mode: 'demo',
        summary: {
          opportunities_scanned: entries.length,
          urls_checked: totalChecked,
          ok: okCount,
          failed: failedCount,
          skipped: skippedCount,
          issues_flagged: issuesList.length,
        },
        entries,
        issues: issuesList,
      },
    });
  } catch (err) {
    console.error('[POST /api/verify]', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * In demo mode we simulate URL checks. Real URLs from known demo
 * domains are assumed OK; anything else has a small random failure chance.
 */
function simulateUrlCheck(url: string): boolean {
  try {
    const parsed = new URL(url);
    const knownDemoHosts = [
      'raleighnc.gov', 'www.wcpss.net', 'www.ncsu.edu', 'tip.duke.edu',
      'foodbankcenc.org', 'habitatwake.org', 'marbleskidsmuseum.org',
      'www.wake.gov', 'wake.gov', 'www.bgcwake.org', 'jaenc.org',
      'apexnc.org', 'scioly.org',
    ];

    if (knownDemoHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return true;
    }

    return Math.random() > 0.15;
  } catch {
    return false;
  }
}
