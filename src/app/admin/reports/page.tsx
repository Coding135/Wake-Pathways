'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import type { IssueReportStatus, OpportunityIssueReport } from '@/types/database';
import { OPPORTUNITY_ISSUE_TYPE_LABELS } from '@/lib/opportunity-issue-reports/constants';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type StatusFilter = IssueReportStatus | 'all';

const STATUS_LABELS: Record<StatusFilter, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
  all: 'All',
};

export default function AdminIssueReportsPage() {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [reports, setReports] = useState<OpportunityIssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/admin/opportunity-issue-reports?status=${encodeURIComponent(status)}`,
        { credentials: 'include' }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not load reports');
        setReports([]);
        return;
      }
      setReports((data.reports as OpportunityIssueReport[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setReportStatus(id: string, next: IssueReportStatus) {
    setActionId(id);
    try {
      const res = await fetch('/api/admin/opportunity-issue-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : 'Update failed');
        return;
      }
      await load();
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <title>Listing reports - Wake Pathways Admin</title>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Listing issue reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reports from the &quot;Report an issue&quot; flow on opportunity pages. Sign in with an
          email in REVIEW_MODERATOR_EMAILS. The server needs SUPABASE_SERVICE_ROLE_KEY.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['open', 'reviewed', 'resolved', 'all'] as const).map((s) => (
          <Button
            key={s}
            type="button"
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(s)}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && reports.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports in this queue.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {OPPORTUNITY_ISSUE_TYPE_LABELS[r.issue_type]}
                        </Badge>
                        <Badge variant="secondary">{r.status}</Badge>
                        <Link
                          href={`/opportunities/${encodeURIComponent(r.opportunity_slug)}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View listing
                        </Link>
                      </div>
                      {r.description ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {r.description}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">No extra details</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {r.opportunity_slug} · {formatDate(r.created_at)}
                        {r.reporter_email ? ` · ${r.reporter_email}` : ''}
                        {r.reporter_user_id ? ' · Signed-in reporter' : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.status !== 'open' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actionId === r.id}
                          onClick={() => void setReportStatus(r.id, 'open')}
                        >
                          {actionId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Open'}
                        </Button>
                      )}
                      {r.status !== 'reviewed' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actionId === r.id}
                          onClick={() => void setReportStatus(r.id, 'reviewed')}
                        >
                          {actionId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Reviewed'
                          )}
                        </Button>
                      )}
                      {r.status !== 'resolved' && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={actionId === r.id}
                          onClick={() => void setReportStatus(r.id, 'resolved')}
                        >
                          {actionId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Resolved'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
