import { getOpportunityBySlug } from '@/lib/mock-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const opportunity = getOpportunityBySlug(slug);

    if (!opportunity) {
      return Response.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    return Response.json(opportunity);
  } catch (err) {
    console.error('[GET /api/opportunities/[slug]]', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
