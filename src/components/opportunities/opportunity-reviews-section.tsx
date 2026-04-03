'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, Pencil, Trash2, Flag, Loader2 } from 'lucide-react';
import type { OpportunityReview } from '@/types/database';
import {
  buildReviewRequestJsonBody,
  fieldErrorsFromReviewApiPayload,
  type ReviewApiFieldKey,
  type ReviewFieldErrorMap,
  type ReviewFormValues,
  parseOptionalGradeLevel,
  parseOptionalGraduationYear,
} from '@/lib/reviews/client-payload';
import { REVIEW_GRADUATION_YEAR_MAX, REVIEW_GRADUATION_YEAR_MIN } from '@/lib/reviews/validation';
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
  const [fieldErrors, setFieldErrors] = useState<ReviewFieldErrorMap>({});
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
      className="mb-8 scroll-mt-24 rounded-2xl border border-border bg-muted/20 p-4 shadow-sm dark:bg-muted/10 dark:shadow-none sm:p-8"
      aria-labelledby="opportunity-reviews-heading"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="opportunity-reviews-heading"
            className="text-lg font-semibold text-foreground sm:text-xl"
          >
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
                      <p className="break-words text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
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
        <div className="mb-6 rounded-lg border border-border bg-background/90 px-4 py-4 text-sm shadow-sm dark:bg-card/80">
          <p className="font-medium text-foreground">No published reviews yet</p>
          <p className="mt-1.5 leading-relaxed text-muted-foreground">
            If you participated, a short honest note helps other students decide if this opportunity
            is a good fit. New reviews are checked before they appear here.
          </p>
        </div>
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
          fieldErrors={fieldErrors}
          onClearFieldError={(key: ReviewApiFieldKey) => {
            setFieldErrors((prev) => {
              if (!prev[key]) return prev;
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(false);
            setError('');
            setFieldErrors({});
          }}
          onSubmit={async (payload) => {
            if (payload.rating < 1) {
              setError('Please choose a star rating.');
              setFieldErrors((prev) => ({ ...prev, rating: 'Please choose a star rating.' }));
              return;
            }
            setLoading(true);
            setError('');
            setFieldErrors({});
            try {
              const isUpdate = Boolean(myReview);
              const url = isUpdate
                ? `/api/opportunities/${encodeURIComponent(slug)}/reviews/${myReview!.id}`
                : `/api/opportunities/${encodeURIComponent(slug)}/reviews`;
              const res = await fetch(url, {
                method: isUpdate ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(buildReviewRequestJsonBody(payload)),
              });
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
                fields?: unknown;
              };
              if (!res.ok) {
                const fe = fieldErrorsFromReviewApiPayload(data);
                setFieldErrors(fe);
                const apiError = typeof data.error === 'string' ? data.error : '';
                setError(Object.keys(fe).length > 0 ? '' : apiError || 'Something went wrong');
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

function ReviewForm({
  slug,
  existing,
  profileName,
  loading,
  error,
  fieldErrors,
  onClearFieldError,
  onCancel,
  onSubmit,
}: {
  slug: string;
  existing: OpportunityReview | null;
  profileName: string;
  loading: boolean;
  error: string;
  fieldErrors: ReviewFieldErrorMap;
  onClearFieldError: (key: ReviewApiFieldKey) => void;
  onCancel: () => void;
  onSubmit: (p: ReviewFormValues) => Promise<void>;
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
  const [clientGradYearHint, setClientGradYearHint] = useState('');
  const [clientGradeHint, setClientGradeHint] = useState('');

  useEffect(() => {
    setClientGradYearHint('');
    setClientGradeHint('');
  }, [existing?.id]);

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
            const gyRaw = gradYear.trim();
            if (gyRaw.length > 0) {
              const gyNum = parseInt(gyRaw, 10);
              if (
                !Number.isFinite(gyNum) ||
                gyNum < REVIEW_GRADUATION_YEAR_MIN ||
                gyNum > REVIEW_GRADUATION_YEAR_MAX
              ) {
                setClientGradYearHint(
                  `Use a year between ${REVIEW_GRADUATION_YEAR_MIN} and ${REVIEW_GRADUATION_YEAR_MAX}, or leave this blank.`
                );
                return;
              }
            }
            setClientGradYearHint('');
            const gRaw = gradeLevel.trim();
            if (gRaw.length > 0) {
              const gNum = parseInt(gRaw, 10);
              if (!Number.isFinite(gNum) || gNum < 6 || gNum > 12) {
                setClientGradeHint('Use a grade from 6 to 12, or leave this blank.');
                return;
              }
            }
            setClientGradeHint('');
            void onSubmit({
              rating,
              title: title.trim() || undefined,
              body: body.trim(),
              display_name: displayName.trim(),
              graduation_year: parseOptionalGraduationYear(gradYear),
              grade_level: parseOptionalGradeLevel(gradeLevel),
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
                  onClick={() => {
                    onClearFieldError('rating');
                    setRating(n);
                  }}
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
            {(rating === 0 || fieldErrors.rating) && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.rating ?? (rating === 0 ? 'Choose a star rating' : '')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-title-${slug}`}>
              Short title <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id={`rev-title-${slug}`}
              value={title}
              onChange={(e) => {
                onClearFieldError('title');
                setTitle(e.target.value);
              }}
              maxLength={120}
              placeholder="e.g. Great summer experience"
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-body-${slug}`}>
              Your review
            </label>
            <Textarea
              id={`rev-body-${slug}`}
              value={body}
              onChange={(e) => {
                onClearFieldError('body');
                setBody(e.target.value);
              }}
              rows={5}
              maxLength={2000}
              placeholder="What happened? What would you tell another student?"
              className="resize-y min-h-[120px]"
              aria-invalid={Boolean(fieldErrors.body)}
            />
            <p className="text-xs text-muted-foreground">{body.length} / 2000 (at least 20 characters)</p>
            {fieldErrors.body && <p className="text-xs text-destructive">{fieldErrors.body}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`rev-name-${slug}`}>
              Display name
            </label>
            <Input
              id={`rev-name-${slug}`}
              value={displayName}
              onChange={(e) => {
                onClearFieldError('display_name');
                setDisplayName(e.target.value);
              }}
              maxLength={80}
              placeholder="First name or how you want to appear"
              required
              aria-invalid={Boolean(fieldErrors.display_name)}
            />
            {fieldErrors.display_name && (
              <p className="text-xs text-destructive">{fieldErrors.display_name}</p>
            )}
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
                onChange={(e) => {
                  onClearFieldError('grade_level');
                  setClientGradeHint('');
                  setGradeLevel(e.target.value.replace(/\D/g, '').slice(0, 2));
                }}
                placeholder="6 to 12"
                aria-invalid={Boolean(fieldErrors.grade_level)}
              />
              {(fieldErrors.grade_level || clientGradeHint) && (
                <p className="text-xs text-destructive">{fieldErrors.grade_level ?? clientGradeHint}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`rev-year-${slug}`}>
                Graduation year <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id={`rev-year-${slug}`}
                inputMode="numeric"
                value={gradYear}
                onChange={(e) => {
                  onClearFieldError('graduation_year');
                  setClientGradYearHint('');
                  setGradYear(e.target.value.replace(/\D/g, '').slice(0, 4));
                }}
                placeholder={`${REVIEW_GRADUATION_YEAR_MIN}-${REVIEW_GRADUATION_YEAR_MAX}`}
                aria-invalid={Boolean(fieldErrors.graduation_year)}
              />
              <p className="text-xs text-muted-foreground">
                Use a year between {REVIEW_GRADUATION_YEAR_MIN} and {REVIEW_GRADUATION_YEAR_MAX}, or leave blank.
              </p>
              {(fieldErrors.graduation_year || clientGradYearHint) && (
                <p className="text-xs text-destructive">
                  {fieldErrors.graduation_year ?? clientGradYearHint}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Would you recommend this to another student?</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`rec-${slug}`}
                  checked={rec === 'yes'}
                  onChange={() => {
                    onClearFieldError('would_recommend');
                    setRec('yes');
                  }}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`rec-${slug}`}
                  checked={rec === 'no'}
                  onChange={() => {
                    onClearFieldError('would_recommend');
                    setRec('no');
                  }}
                />
                No
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`rec-${slug}`}
                  checked={rec === 'skip'}
                  onChange={() => {
                    onClearFieldError('would_recommend');
                    setRec('skip');
                  }}
                />
                Prefer not to say
              </label>
            </div>
            {fieldErrors.would_recommend && (
              <p className="mt-2 text-xs text-destructive">{fieldErrors.would_recommend}</p>
            )}
          </div>

          <div className="space-y-1">
            <Checkbox
              label="I participated in or attended this opportunity."
              checked={participated}
              onChange={(e) => {
                onClearFieldError('participated');
                setParticipated((e.target as HTMLInputElement).checked);
              }}
            />
            {fieldErrors.participated && (
              <p className="text-xs text-destructive">{fieldErrors.participated}</p>
            )}
          </div>

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
