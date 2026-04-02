import { z } from 'zod';

const opportunityCategorySchema = z.enum([
  'internship',
  'volunteer',
  'scholarship',
  'summer_program',
  'research',
  'competition',
  'leadership',
  'job',
  'mentorship',
  'other',
]);

const remoteTypeSchema = z.enum(['in_person', 'remote', 'hybrid']);
const paidTypeSchema = z.enum(['paid', 'unpaid', 'stipend', 'varies']);
const applicationStatusSchema = z.enum([
  'open',
  'closing_soon',
  'rolling',
  'closed',
  'unknown',
]);

export const submitOpportunitySchema = z.object({
  organization_name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Organization name is too long'),

  contact_name: z
    .string()
    .min(2, 'Please enter your name')
    .max(100, 'Name is too long'),

  contact_email: z
    .string()
    .email('Please enter a valid email address'),

  opportunity_title: z
    .string()
    .min(5, 'Opportunity title must be at least 5 characters')
    .max(200, 'Title is too long'),

  category: opportunityCategorySchema,

  short_summary: z
    .string()
    .min(20, 'Summary should be at least 20 characters')
    .max(300, 'Summary should be under 300 characters'),

  full_description: z
    .string()
    .max(5000, 'Description is too long (5000 character limit)')
    .optional()
    .or(z.literal('')),

  eligibility: z
    .string()
    .max(1000, 'Eligibility text is too long')
    .optional()
    .or(z.literal('')),

  grades_min: z.coerce
    .number()
    .int()
    .min(6, 'Minimum grade is 6th')
    .max(12, 'Maximum grade is 12th')
    .optional()
    .nullable(),

  grades_max: z.coerce
    .number()
    .int()
    .min(6, 'Minimum grade is 6th')
    .max(12, 'Maximum grade is 12th')
    .optional()
    .nullable(),

  age_min: z.coerce
    .number()
    .int()
    .min(10, 'Minimum age is 10')
    .max(22, 'Maximum age is 22')
    .optional()
    .nullable(),

  age_max: z.coerce
    .number()
    .int()
    .min(10, 'Minimum age is 10')
    .max(22, 'Maximum age is 22')
    .optional()
    .nullable(),

  location_city: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  remote_type: remoteTypeSchema,
  paid_type: paidTypeSchema,

  compensation_text: z.string().max(200).optional().or(z.literal('')),
  cost_text: z.string().max(200).optional().or(z.literal('')),
  is_free: z.boolean(),

  deadline_at: z.string().optional().or(z.literal('')),

  official_application_url: z
    .string()
    .url('Please enter a valid URL (include https://)')
    .optional()
    .or(z.literal('')),

  supporting_url: z
    .string()
    .url('Please enter a valid URL (include https://)')
    .optional()
    .or(z.literal('')),

  verification_notes: z.string().max(1000).optional().or(z.literal('')),
});

export type SubmitOpportunityInput = z.infer<typeof submitOpportunitySchema>;

export const opportunityFiltersSchema = z.object({
  search: z.string().optional(),
  category: opportunityCategorySchema.optional(),
  city: z.string().optional(),
  remote_type: remoteTypeSchema.optional(),
  paid_type: paidTypeSchema.optional(),
  application_status: applicationStatusSchema.optional(),
  grade: z.coerce.number().int().min(6).max(12).optional(),
  age: z.coerce.number().int().min(10).max(22).optional(),
  verified_only: z.string().transform((v) => v === 'true').optional(),
  is_free: z.string().transform((v) => v === 'true').optional(),
  interests: z.string().max(800).optional(),
  sort: z
    .enum(['deadline_asc', 'deadline_desc', 'created_desc', 'created_asc', 'title_asc', 'title_desc'])
    .optional()
    .default('created_desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;

export const adminReviewSchema = z.object({
  submission_id: z.string().min(1, 'Submission ID is required'),
  action: z.enum(['approved', 'rejected', 'needs_edits'], {
    errorMap: () => ({ message: 'Please select an action' }),
  }),
  admin_notes: z.string().max(2000, 'Notes are too long').optional().or(z.literal('')),
});

export type AdminReviewInput = z.infer<typeof adminReviewSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message should be at least 20 characters').max(5000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
