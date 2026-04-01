import { type NextRequest } from 'next/server';
import { submitOpportunitySchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/server';
import { readSupabasePublicEnv } from '@/lib/supabase/env';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export const dynamic = 'force-dynamic';

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null || s.trim() === '') return null;
  return s.trim();
}

function deadlineToIso(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const d = new Date(t.includes('T') ? t : `${t}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Safe for DB integer columns: never NaN; null when absent or invalid. */
function intOrNull(v: number | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return Math.trunc(v);
}

function logInsertError(
  label: string,
  error: { message?: string; code?: string; details?: string | null; hint?: string | null }
) {
  console.error(`[POST /api/submissions] ${label}`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function insertFailedResponse(error: {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}) {
  const payload: Record<string, unknown> = {
    error: 'Could not save submission. Please try again later.',
  };
  if (process.env.NODE_ENV === 'development') {
    payload.dev = {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    };
  }
  return Response.json(payload, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    if (!readSupabasePublicEnv()) {
      return Response.json(
        { error: 'Submissions are not available (Supabase is not configured)' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = submitOpportunitySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const supabase = await createClient();

    // Keys must match public.submissions only (no extra PostgREST columns).
    const row = {
      organization_name: d.organization_name,
      contact_name: emptyToNull(d.contact_name),
      contact_email: d.contact_email,
      opportunity_title: d.opportunity_title,
      category: d.category,
      short_summary: emptyToNull(d.short_summary),
      full_description: emptyToNull(d.full_description),
      eligibility: emptyToNull(d.eligibility),
      grades_min: intOrNull(d.grades_min ?? undefined),
      grades_max: intOrNull(d.grades_max ?? undefined),
      age_min: intOrNull(d.age_min ?? undefined),
      age_max: intOrNull(d.age_max ?? undefined),
      location_city: emptyToNull(d.location_city),
      remote_type: d.remote_type,
      paid_type: d.paid_type,
      compensation_text: emptyToNull(d.compensation_text),
      cost_text: emptyToNull(d.cost_text),
      is_free: Boolean(d.is_free),
      deadline_at: deadlineToIso(d.deadline_at),
      official_application_url: emptyToNull(d.official_application_url),
      supporting_url: emptyToNull(d.supporting_url),
      logo_url: null,
      verification_notes: emptyToNull(d.verification_notes),
      status: 'pending' as const,
      admin_notes: null,
      reviewed_at: null,
      reviewed_by: null,
    };

    const admin = createServiceRoleClient();
    if (admin) {
      const { data: inserted, error } = await admin.from('submissions').insert(row).select('id').single();
      if (error) {
        logInsertError('insert (service role)', error);
        return insertFailedResponse(error);
      }
      return Response.json(
        {
          message: 'Submission received successfully',
          submission_id: inserted.id,
          status: 'pending',
        },
        { status: 201 }
      );
    }

    // Anon session: INSERT is allowed by RLS, but there is no SELECT policy — do not chain .select()
    // after insert or PostgREST returns an RLS/permission error even when the row was written.
    const { error } = await supabase.from('submissions').insert(row);
    if (error) {
      logInsertError('insert (anon, no returning)', error);
      return insertFailedResponse(error);
    }

    return Response.json(
      {
        message: 'Submission received successfully',
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    console.error('[POST /api/submissions]', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
