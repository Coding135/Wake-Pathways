import { describe, it, expect } from 'vitest';
import {
  submitOpportunitySchema,
  adminReviewSchema,
} from '@/lib/schemas';

describe('submitOpportunitySchema', () => {
  const validData = {
    organization_name: 'Test Organization',
    contact_name: 'Jane Doe',
    contact_email: 'jane@example.com',
    opportunity_title: 'Summer Youth Program 2026',
    category: 'summer_program' as const,
    short_summary: 'A great summer program for Wake County teens offering hands-on STEM experience.',
    remote_type: 'in_person' as const,
    paid_type: 'unpaid' as const,
    is_free: true,
  };

  it('validates valid data', () => {
    const result = submitOpportunitySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = submitOpportunitySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('organization_name');
      expect(paths).toContain('contact_email');
      expect(paths).toContain('opportunity_title');
    }
  });

  it('rejects invalid email', () => {
    const result = submitOpportunitySchema.safeParse({
      ...validData,
      contact_email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('contact_email'))).toBe(true);
    }
  });

  it('rejects too-short summary', () => {
    const result = submitOpportunitySchema.safeParse({
      ...validData,
      short_summary: 'Too short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('short_summary'))).toBe(true);
    }
  });

  it('accepts optional fields when omitted', () => {
    const result = submitOpportunitySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = submitOpportunitySchema.safeParse({
      ...validData,
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });
});

describe('adminReviewSchema', () => {
  it('validates valid data', () => {
    const result = adminReviewSchema.safeParse({
      submission_id: 'sub-001',
      action: 'approved',
      admin_notes: 'Looks good, verified the organization.',
    });
    expect(result.success).toBe(true);
  });

  it('validates without optional admin_notes', () => {
    const result = adminReviewSchema.safeParse({
      submission_id: 'sub-001',
      action: 'rejected',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing submission_id', () => {
    const result = adminReviewSchema.safeParse({
      action: 'approved',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('submission_id'))).toBe(true);
    }
  });

  it('rejects empty submission_id', () => {
    const result = adminReviewSchema.safeParse({
      submission_id: '',
      action: 'approved',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid action', () => {
    const result = adminReviewSchema.safeParse({
      submission_id: 'sub-001',
      action: 'invalid_action',
    });
    expect(result.success).toBe(false);
  });
});
