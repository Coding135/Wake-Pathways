import { REVIEW_GRADUATION_YEAR_MAX, REVIEW_GRADUATION_YEAR_MIN } from '@/lib/reviews/validation';

const REVIEW_API_FIELD_KEYS = [
  'rating',
  'title',
  'body',
  'display_name',
  'graduation_year',
  'grade_level',
  'participated',
  'would_recommend',
] as const;

export type ReviewApiFieldKey = (typeof REVIEW_API_FIELD_KEYS)[number];

export type ReviewFieldErrorMap = Partial<Record<ReviewApiFieldKey, string>>;

/** First validation message per field from API `fields` object. */
export function fieldErrorsFromReviewApiPayload(data: unknown): ReviewFieldErrorMap {
  if (!data || typeof data !== 'object' || data === null) return {};
  const raw = (data as { fields?: unknown }).fields;
  if (!raw || typeof raw !== 'object') return {};
  const out: ReviewFieldErrorMap = {};
  for (const k of REVIEW_API_FIELD_KEYS) {
    const msgs = (raw as Record<string, unknown>)[k];
    if (Array.isArray(msgs) && typeof msgs[0] === 'string' && msgs[0].length > 0) {
      out[k] = msgs[0];
    }
  }
  return out;
}

export type ReviewFormValues = {
  rating: number;
  title?: string;
  body: string;
  display_name: string;
  graduation_year: number | null;
  grade_level: number | null;
  participated: boolean;
  would_recommend: boolean | null;
};

/** JSON body for POST/PATCH — matches reviewBodySchema after parse. */
export function buildReviewRequestJsonBody(values: ReviewFormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {
    rating: values.rating,
    body: values.body.trim(),
    display_name: values.display_name.trim(),
    participated: values.participated,
    would_recommend: values.would_recommend,
    graduation_year: values.graduation_year,
    grade_level: values.grade_level,
  };
  const title = values.title?.trim();
  if (title) body.title = title;
  return body;
}

export function parseOptionalGraduationYear(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n)) return null;
  if (n < REVIEW_GRADUATION_YEAR_MIN || n > REVIEW_GRADUATION_YEAR_MAX) return null;
  return n;
}

export function parseOptionalGradeLevel(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 6 || n > 12) return null;
  return n;
}
