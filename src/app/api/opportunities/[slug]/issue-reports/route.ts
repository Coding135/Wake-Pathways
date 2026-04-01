import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOpportunityBySlug } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import {
  OPPORTUNITY_ISSUE_TYPES,
  type OpportunityIssueType,
} from '@/lib/opportunity-issue-reports/constants';

const issueTypeEnum = z.enum(OPPORTUNITY_ISSUE_TYPES);

function buildPayloadSchema(isSignedIn: boolean) {
  return z
    .object({
      issue_type: issueTypeEnum,
      description: z.string().max(2000).optional().default(''),
      reporter_email: z.string().max(320).optional().default(''),
    })
    .superRefine((data, ctx) => {
      const desc = data.description.trim();
      const email = data.reporter_email.trim();
      if (data.issue_type === 'other' && desc.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please add a few words about what is wrong.',
          path: ['description'],
        });
      }
      if (!isSignedIn && !email && desc.length < 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Add a short note (15 characters or more) or an email so we can follow up.',
          path: ['description'],
        });
      }
      if (email.length > 0) {
        const em = z.string().email();
        const r = em.safeParse(email);
        if (!r.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid email or leave it blank.',
            path: ['reporter_email'],
          });
        }
      }
    });
}

async function findRecentDuplicate(
  admin: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  slug: string,
  issueType: OpportunityIssueType,
  userId: string | null,
  emailNorm: string | null,
  descriptionNorm: string | null
): Promise<boolean> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  if (userId) {
    const { data } = await admin
      .from('opportunity_issue_reports')
      .select('id')
      .eq('opportunity_slug', slug)
      .eq('issue_type', issueType)
      .eq('reporter_user_id', userId)
      .gte('created_at', dayAgo)
      .limit(1)
      .maybeSingle();
    return data != null;
  }

  if (emailNorm) {
    const { data } = await admin
      .from('opportunity_issue_reports')
      .select('id')
      .eq('opportunity_slug', slug)
      .eq('issue_type', issueType)
      .is('reporter_user_id', null)
      .eq('reporter_email', emailNorm)
      .gte('created_at', dayAgo)
      .limit(1)
      .maybeSingle();
    return data != null;
  }

  if (descriptionNorm) {
    const { data } = await admin
      .from('opportunity_issue_reports')
      .select('id')
      .eq('opportunity_slug', slug)
      .eq('issue_type', issueType)
      .is('reporter_user_id', null)
      .is('reporter_email', null)
      .eq('description', descriptionNorm)
      .gte('created_at', hourAgo)
      .limit(1)
      .maybeSingle();
    return data != null;
  }

  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!getOpportunityBySlug(slug)) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const supabaseUser = await createClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();

  const raw = z
    .object({
      issue_type: z.unknown(),
      description: z.unknown().optional(),
      reporter_email: z.unknown().optional(),
      company: z.unknown().optional(),
    })
    .safeParse(json);

  if (!raw.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const companyStr =
    typeof raw.data.company === 'string' ? raw.data.company : '';
  if (companyStr.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const schema = buildPayloadSchema(!!user);
  const coerced = {
    issue_type: raw.data.issue_type,
    description: typeof raw.data.description === 'string' ? raw.data.description : '',
    reporter_email: typeof raw.data.reporter_email === 'string' ? raw.data.reporter_email : '',
  };
  const parsed = schema.safeParse(coerced);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.description?.[0] ??
      first.reporter_email?.[0] ??
      first.issue_type?.[0] ??
      'Check your input and try again.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Reporting is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const descTrim = parsed.data.description.trim();
  const emailTrim = parsed.data.reporter_email.trim().toLowerCase();
  const descriptionVal = descTrim.length > 0 ? descTrim : null;
  const emailVal = emailTrim.length > 0 ? emailTrim : null;

  const dup = await findRecentDuplicate(
    admin,
    slug,
    parsed.data.issue_type as OpportunityIssueType,
    user?.id ?? null,
    emailVal,
    descriptionVal
  );
  if (dup) {
    return NextResponse.json(
      {
        error:
          'You recently sent a similar report for this listing. Thanks for helping us stay accurate.',
      },
      { status: 429 }
    );
  }

  const { error } = await admin.from('opportunity_issue_reports').insert({
    opportunity_slug: slug,
    issue_type: parsed.data.issue_type,
    description: descriptionVal,
    reporter_user_id: user?.id ?? null,
    reporter_email: emailVal,
    status: 'open',
  });

  if (error) {
    console.error('[issue-reports insert]', error);
    return NextResponse.json(
      { error: 'Could not send your report. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
