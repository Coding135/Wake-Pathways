import { type NextRequest } from 'next/server';
import { submitOpportunitySchema } from '@/lib/schemas';
import { getSubmissions } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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

    const submission = {
      id: `sub-demo-${Date.now()}`,
      ...parsed.data,
      status: 'pending' as const,
      admin_notes: null,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return Response.json(
      {
        message: 'Submission received successfully',
        submission_id: submission.id,
        status: submission.status,
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

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') ?? undefined;
    const submissions = getSubmissions(status);

    return Response.json({
      data: submissions,
      total: submissions.length,
    });
  } catch (err) {
    console.error('[GET /api/submissions]', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
