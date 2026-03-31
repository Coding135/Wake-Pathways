import { type NextRequest } from 'next/server';
import { getOpportunities } from '@/lib/mock-data';
import { opportunityFiltersSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = opportunityFiltersSchema.safeParse(rawParams);

    if (!parsed.success) {
      return Response.json(
        {
          error: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = getOpportunities(parsed.data);

    return Response.json(result);
  } catch (err) {
    console.error('[GET /api/opportunities]', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
