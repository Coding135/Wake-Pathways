import { z } from 'zod';

export const reviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z
    .string()
    .max(120, 'Title is too long')
    .optional()
    .transform((s) => (s?.trim() ? s.trim() : undefined)),
  body: z.string().trim().min(20, 'Please write at least a few sentences').max(2000, 'Review is too long'),
  display_name: z.string().trim().min(1, 'Add how you want your name to appear').max(80, 'Name is too long'),
  graduation_year: z
    .union([z.coerce.number().int().min(2000).max(2100), z.literal(''), z.null(), z.undefined()])
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
