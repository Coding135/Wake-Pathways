import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export const dynamic = 'force-dynamic';

const bodySchema = z
  .object({
    message: z.string().trim().min(15, 'Please write at least a few words.').max(4000),
    contact_email: z.string().trim().max(320),
  })
  .superRefine((data, ctx) => {
    const email = data.contact_email;
    if (email.length === 0) return;
    const r = z.string().email().safeParse(email);
    if (!r.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid email or leave it blank.',
        path: ['contact_email'],
      });
    }
  });

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const raw = z
    .object({
      message: z.unknown(),
      contact_email: z.unknown().optional(),
      company: z.unknown().optional(),
    })
    .safeParse(json);

  if (!raw.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const companyStr = typeof raw.data.company === 'string' ? raw.data.company : '';
  if (companyStr.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const coerced = {
    message: typeof raw.data.message === 'string' ? raw.data.message : '',
    contact_email: typeof raw.data.contact_email === 'string' ? raw.data.contact_email : '',
  };

  const parsed = bodySchema.safeParse(coerced);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg =
      flat.fieldErrors.message?.[0] ??
      flat.fieldErrors.contact_email?.[0] ??
      'Check your input and try again.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          'Feedback cannot be saved right now. Please email wakepathways@gmail.com and we will read it.',
      },
      { status: 503 }
    );
  }

  const supabaseUser = await createClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();

  const emailTrim = parsed.data.contact_email.trim().toLowerCase();
  const row: Record<string, unknown> = {
    message: parsed.data.message.trim(),
    contact_email: emailTrim.length > 0 ? emailTrim : null,
  };
  if (user?.id) {
    row.reporter_user_id = user.id;
  }

  const { error } = await admin.from('site_feedback').insert(row);

  if (error) {
    console.error('[POST /api/feedback]', error);
    const looksMissing =
      /does not exist|schema cache|PGRST20[25]|42P01/i.test(error.message ?? '') ||
      /permission denied|row-level security/i.test(error.message ?? '');
    return NextResponse.json(
      {
        error: looksMissing
          ? 'Feedback is not set up yet. Please email wakepathways@gmail.com.'
          : 'Could not send your message. Please try again or email wakepathways@gmail.com.',
      },
      { status: looksMissing ? 503 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
