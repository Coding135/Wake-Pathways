'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, Pencil, Trash2, Flag, Loader2 } from 'lucide-react';
import type { OpportunityReview } from '@/types/database';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  slug: string;
  initialApproved: OpportunityReview[];
  initialMyReview: OpportunityReview | null;
  userId: string | null;
  profileName: string;
  loadError: boolean;
};

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/35'
          )}
        />
      ))}
    </div>
  );
}

export function OpportunityReviewsSection({
  slug,
  initialApproved,
  initialMyReview,
  userId,
  profileName,
  loadError,
}: Props) {
  const router = useRouter();
  const [approved, setApproved] = useState(initialApproved);
  const [myReview, setMyReview] = useState(initialMyReview);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formBanner, setFormBanner] = useState('');

  const returnToOpp = `/opportunities/${slug}`;
  const loginNext = `/login?next=${encodeURIComponent(returnToOpp)}`;
  const signupNext = `/signup?next=${encodeURIComponent(returnToOpp)}`;

  async function handleDelete() {
    if (!myReview || !window.confirm('Delete your review? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/opportunities/${encodeURIComponent(slug)}/reviews/${myReview.id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(typeof data.error === 'string' ? data.error : 'Could not delete');
        return;
      }
      await refresh();
      setMyReview(null);
      setFormBanner('');
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    if (approved.length === 0) return null;
    const sum = approved.reduce((a, r) => a + r.rating, 0);
    const avg = sum / approved.length;
    return { avg: Math.round(avg * 10) / 10, count: approved.length };
  }, [approved]);

  async function refresh() {
    const res = await fetch(`/api/opportunities/${encodeURIComponent(slug)}/reviews`, {
      credentials: 'include',
    });
    if (!res.ok) return;
    const data = (await res.json()) as { approved: OpportunityReview[]; myReview: OpportunityReview | null };
    setApproved(data.approved);
    setMyReview(data.myReview);
    router.refresh();
  }

  return (
    <section
      className="mb-8 scroll-mt-24 rounded-2xl border border-border bg-muted/20 p-6 shadow-sm dark:bg-muted/10 dark:shadow-none sm:p-8"
      aria-labelledby="opportunity-reviews-heading"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="opportunity-reviews-heading" className="text-xl font-semibold text-foreground">
            Reviews & testimonials
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real experiences from students who participated. New reviews are checked before they appear
            here.
          </p>
        </div>
        {!loadError && summary && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarsDisplay rating={Math.round(summary.avg)} />
            <span className="font-medium text-foreground">{summary.avg}</span>
            <span>({summary.count} {summary.count === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground dark:border-amber-400/35 dark:bg-amber-400/10">
          <p className="font-medium text-foreground">We couldn&apos;t load reviews right now.</p>
          <p className="mt-1 text-muted-foreground">
            This is usually a temporary connection or setup issue. You can still use the rest of this
            listing.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.refresh()}
          >
            Try again
          </Button>
        </div>
      )}

      {formBanner && (
        <div className="mb-6 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {formBanner}
        </div>
      )}

      {!loadError && approved.length > 0 && (
        <ul className="mb-8 space-y-4">
          {approved.map((r) => (
            <li key={r.id}>
              <Card className="border-border shadow-sm dark:shadow-none">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarsDisplay rating={r.rating} />
                        {r.would_recommend === true && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <ThumbsUp className="h-3 w-3" />
                            Would recommend
                          </Badge>
                        )}
                        {r.would_recommend === false && (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" />
                            Would not recommend
                          </span>
                        )}
                      </div>
                      {r.title && <p className="font-medium text-foreground">{r.title}</p>}
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {r.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.display_name}
                        {r.grade_level != null && ` · Grade ${r.grade_level}`}
                        {r.graduation_year != null && ` · Class of ${r.graduation_year}`}
                        {r.participated && ' · Participated'}
                        <span className="text-muted-foreground/80"> · {formatDate(r.created_at)}</span>
                      </p>
                    </div>
                    {userId && r.user_id !== userId && (
                      <FlagReviewButton reviewId={r.id} slug={slug} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {!loadError && approved.length === 0 && !myReview && (
        <p className="mb-6 text-sm text-muted-foreground">No published reviews yet. Be the first to share your experience.</p>
      )}

      {loadError && !userId && (
        <p className="mb-6 text-sm text-muted-foreground">
          When reviews are available, you can read what other students said and share your own experience.
        </p>
      )}

      {loadError && userId && (
        <p className="mb-6 text-sm text-muted-foreground">
          We couldn&apos;t load whether you already have a review. Use &quot;Try again&quot; above, or refresh
          the page in a moment.
        </p>
      )}

      {!loadError && myReview && (
        <div className="mb-6 rounded-lg border border-border bg-muted/25 px-4 py-3 text-sm dark:bg-muted/15">
          {myReview.status === 'pending' && (
            <p className="text-foreground">
              <strong>Your review is waiting for a quick check.</strong> It will show up here after it is
              approved. You can still edit it below.
            </p>
          )}
          {myReview.status === 'rejected' && (
            <p className="text-foreground">
              <strong>Your review was not published.</strong> You can edit it and send it again for another
              look.
            </p>
          )}
          {myReview.status === 'approved' && (
            <p className="text-muted-foreground">
              You have already shared a review. You can update it anytime; it may be rechecked before staying
              public.
            </p>
          )}
        </div>
      )}

      {!userId && (
        <div className="rounded-xl border border-border bg-background/80 p-5 shadow-sm dark:bg-card/80 dark:shadow-none">
          <p className="text-sm text-muted-foreground">
            <Link href={loginNext} className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            or{' '}
            <Link href={signupNext} className="font-medium text-primary hover:underline">
              create an account
            </Link>{' '}
            to share your experience with this opportunity.
          </p>
        </div>
      )}

      {userId && !loadError && !showForm && !myReview && (
        <Button type="button" onClick={() => setShowForm(true)} className="gap-1">
          Share your experience
        </Button>
      )}

      {userId && !loadError && myReview && !showForm && !editing && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => { setEditing(true); setShowForm(true); }}>
            <Pencil className="h-3.5 w-3.5" />
            Edit your review
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      )}

      {userId && !loadError && (showForm || (myReview && editing)) && (
        <ReviewForm
          key={myReview?.id ?? 'new-review'}
          slug={slug}
          existing={myReview}
          profileName={profileName}
          loading={loading}
          error={error}
          onCancel={() => {
            setShowForm(false);
            setEditing(false);
            setError('');
          }}
          onSubmit={async (payload) => {
            if (payload.rating < 1) {
              setError('Please choose a star rating.');
              return;
            }
            setLoading(true);
            setError('');
            try {
              const isUpdate = Boolean(myReview);
              const url = isUpdate
                ? `/api/opportunities/${encodeURIComponent(slug)}/reviews/${myReview!.id}`
                : `/api/opportunities/${encodeURIComponent(slug)}/reviews`;
              const res = await fetch(url, {
                method: isUpdate ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                setError(typeof data.error === 'string' ? data.error : 'Something went wrong');
                return;
              }
              const msg = isUpdate
                ? 'Your update was saved. It will be reviewed again before it appears publicly.'
                : 'Thanks! Your review was submitted and will appear after a quick check.';
              await refresh();
              setShowForm(false);
              setEditing(false);
              setFormBanner(msg);
              window.setTimeout(() => setFormBanner(''), 12000);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </section>
  );
}

function FlagReviewButton({ reviewId, slug }: { reviewId: string; slug: string }) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="shrink-0 gap-1 text-muted-foreground"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm('Report this review for a moderator to look at?')) return;
        setPending(true);
        try {
          const res = await fetch(
            `/api/opportunities/${encodeURIComponent(slug)}/reviews/${reviewId}/flag`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: '{}' }
          );
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            alert('Thanks. A moderator will take a look.');
          } else {
            alert(typeof data.error === 'string' ? data.error : 'Could not submit report');
          }
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
      Report
    </Button>
  );
}

type FormPayload = {
  rating: number;
  title?: string;
  body: string;
  display_name: string;
  graduation_year: number | null;
  grade_level: number | null;
  participated: boolean;
  would_recommend: boolean | null;
};

function ReviewForm({
  slug,
  existing,
  profileName,
  loading,
  error,
  onCancel,
  onSubmit,
}: {
  slug: string;
  existing: OpportunityReview | null;
  profileName: string;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (p: FormPayload) => Promise<void>;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [displayName, setDisplayName] = useState(existing?.display_name || profileName || '');
  const [gradYear, setGradYear] = useState(existing?.graduation_year?.toString() ?? '');
  const [gradeLevel, setGradeLevel] = useState(existing?.grade_level?.toString() ?? '');
  const [participated, setParticipated] = useState(existing?.participated ?? false);
  const [rec, setRec] = useState<'yes' | 'no' | 'skip'>(
    existing?.would_recommend === true ? 'yes' : existing?.would_recommend === false ? 'no' : 'skip'
  );

  return (
    <Card className="border-border shadow-sm dark:shadow-none">
      <CardContent className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">
          {existing ? 'Update your review' : 'Write a review'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Only share if you took part or attended. Reviews are read by moderators before they go live.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit({
              rating,
              title: title.trim() || undefined,
              body: body.trim(),
              display_name: displayName.trim(),
              graduation_year: (() => {
                const t = gradYear.trim();
                if (!t) return null;
                const n = parseInt(t, 10);
                return Number.isFinite(n) && n >= 1900 && n <= 2100 ? n : null;
              })(),
              grade_level: (() => {
                const t = gradeLevel.trim();
                if (!t) return null;
                const n = parseInt(t, 10);
                return Number.isFinite(n) && n >= 6 && n <= 12 ? n : null;
              })(),
              participated,
              would_recommend: rec === 'skip' ? null : rec === 'yes',
            });
          }}
        >
          <div>
            <p className="text-sm font-medium text-foreground">Rating</p>
            <p className="text-xs text-muted-foreground mb-2">Required. How was your experience overall?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    n <= rating ? 'text-amber-400' : 'text-muted-foreground/30'
                  )}
                  aria-label={`${n} stars`}
                >
                  <Star className={cn('h-7 w-7', n <= rating && 'fill-current')} />
                </button>
              ))}
            </div>
            {rating === 0 && <p className="mt-1 text-xs text-destructive">Choose a star rating</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-title-${slug}`}>
              Short title <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id={`rev-title-${slug}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Great summer experience"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-body-${slug}`}>
              Your review
            </label>
            <Textarea
              id={`rev-body-${slug}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="What happened? What would you tell another student?"
              className="resize-y min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">{body.length} / 2000</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-name-${slug}`}>
              Display name
            </label>
            <Input
              id={`rev-name-${slug}`}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              placeholder="First name or how you want to appear"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`rev-grade-${slug}`}>
                Grade <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id={`rev-grade-${slug}`}
                inputMode="numeric"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="6 to 12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`rev-year-${slug}`}>
                Graduation year <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id={`rev-year-${slug}`}
                inputMode="numeric"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Would you recommend this to another student?</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`rec-${slug}`} checked={rec === 'yes'} onChange={() => setRec('yes')} />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`rec-${slug}`} checked={rec === 'no'} onChange={() => setRec('no')} />
                No
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`rec-${slug}`} checked={rec === 'skip'} onChange={() => setRec('skip')} />
                Prefer not to say
              </label>
            </div>
          </div>

          <Checkbox
            label="I participated in or attended this opportunity."
            checked={participated}
            onChange={(e) => setParticipated((e.target as HTMLInputElement).checked)}
          />

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading || rating < 1}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {existing ? 'Save changes' : 'Submit review'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
