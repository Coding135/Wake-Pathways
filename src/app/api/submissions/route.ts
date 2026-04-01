import { type NextRequest } from 'next/server';
import { submitOpportunitySchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/server';
import { readSupabasePublicEnv } from '@/lib/supabase/env';

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

    const row = {
      organization_name: d.organization_name,
      contact_name: emptyToNull(d.contact_name),
      contact_email: d.contact_email,
      opportunity_title: d.opportunity_title,
      category: d.category,
      short_summary: emptyToNull(d.short_summary),
      full_description: emptyToNull(d.full_description),
      eligibility: emptyToNull(d.eligibility),
      grades_min: d.grades_min ?? null,
      grades_max: d.grades_max ?? null,
      age_min: d.age_min ?? null,
      age_max: d.age_max ?? null,
      location_city: emptyToNull(d.location_city),
      remote_type: d.remote_type,
      paid_type: d.paid_type,
      compensation_text: emptyToNull(d.compensation_text),
      cost_text: emptyToNull(d.cost_text),
      is_free: d.is_free,
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

    const { data: inserted, error } = await supabase.from('submissions').insert(row).select('id').single();

    if (error) {
      console.error('[POST /api/submissions] insert', error);
      return Response.json({ error: 'Could not save submission. Please try again later.' }, { status: 500 });
    }

    return Response.json(
      {
        message: 'Submission received successfully',
        submission_id: inserted.id,
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
