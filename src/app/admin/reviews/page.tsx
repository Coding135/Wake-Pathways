'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { OpportunityReview } from '@/types/database';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function AdminReviewsPage() {
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [reviews, setReviews] = useState<OpportunityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/opportunity-reviews?status=${status}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not load reviews');
        setReviews([]);
        return;
      }
      setReviews(data.reviews ?? []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setReviewStatus(id: string, next: 'approved' | 'rejected' | 'pending') {
    setActionId(id);
    try {
      const res = await fetch('/api/admin/opportunity-reviews', {
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
      <title>Review moderation - Wake Pathways Admin</title>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Opportunity reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or reject student reviews before they appear on listings. Sign in with an email in
          REVIEW_MODERATOR_EMAILS. The server needs SUPABASE_SERVICE_ROLE_KEY for this queue.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <Button
            key={s}
            type="button"
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(s)}
          >
            {s === 'pending' ? 'Pending' : s === 'approved' ? 'Approved' : 'Rejected'}
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

      {loading && reviews.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews in this queue.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{r.rating} stars</Badge>
                        <Badge variant="secondary">{r.status}</Badge>
                        <Link
                          href={`/opportunities/${encodeURIComponent(r.opportunity_slug)}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View listing
                        </Link>
                      </div>
                      {r.title && <p className="font-medium text-foreground">{r.title}</p>}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.display_name} · {r.opportunity_slug} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.status !== 'approved' && (
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1"
                          disabled={actionId === r.id}
                          onClick={() => void setReviewStatus(r.id, 'approved')}
                        >
                          {actionId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={actionId === r.id}
                          onClick={() => void setReviewStatus(r.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      )}
                      {r.status !== 'pending' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={actionId === r.id}
                          onClick={() => void setReviewStatus(r.id, 'pending')}
                        >
                          Mark pending
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
