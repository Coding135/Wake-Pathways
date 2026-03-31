import { z } from 'zod';

/** Aligned with DB check on public.opportunity_reviews.graduation_year */
export const REVIEW_GRADUATION_YEAR_MIN = 2000;
export const REVIEW_GRADUATION_YEAR_MAX = 2100;

export const reviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((s) => {
      if (s == null) return undefined;
      const t = typeof s === 'string' ? s.trim() : '';
      return t.length > 0 ? t : undefined;
    })
    .pipe(
      z
        .union([z.string().max(120, 'Title is too long'), z.undefined()])
        .optional()
    ),
  body: z.string().trim().min(20, 'Please write at least a few sentences').max(2000, 'Review is too long'),
  display_name: z.string().trim().min(1, 'Add how you want your name to appear').max(80, 'Name is too long'),
  graduation_year: z
    .union([
      z.coerce.number().int().min(REVIEW_GRADUATION_YEAR_MIN).max(REVIEW_GRADUATION_YEAR_MAX),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  grade_level: z
    .union([z.coerce.number().int().min(6).max(12), z.literal(''), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  participated: z.coerce.boolean(),
  would_recommend: z
    .union([z.boolean(), z.literal('true'), z.literal('false'), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null) return null;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return v;
    }),
});

export type ReviewBodyInput = z.infer<typeof reviewBodySchema>;
