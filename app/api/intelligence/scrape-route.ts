import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
/**
 * API Route: Create scraping jobs
 * POST /api/intelligence/scrape
 * GET /api/intelligence/scrape/[jobId]
 */

// Request validation schema
const ScrapingRequestSchema = z.object({
  type: z.nativeEnum(JobType),
  businessName: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  placeId: z.string().optional(),
  siteId: z.string().uuid().optional(),
  priority: z.number().min(0).max(10).default(5),
  options: z.object({
    query: z.string().optional(),
    num: z.number().min(10).max(100).default(20),
    gl: z.string().length(2).default('us'),
    hl: z.string().length(2).default('en'),
    includeRelated: z.boolean().default(false),
    includeCompetitors: z.boolean().default(true)
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const validatedData = ScrapingRequestSchema.parse(body);

    // Create the job
    const job = await jobQueue.createJob({
      type: validatedData.type,
      payload: {
        businessName: validatedData.businessName,
        location: validatedData.location,
        website: validatedData.website,
        placeId: validatedData.placeId,
        options: validatedData.options
      },
      priority: validatedData.priority,
      userId: session.user.id,
      siteId: validatedData.siteId
    });

    logger.info('Scraping job created via API', {
      jobId: job.id,
      type: job.type,
      userId: session.user.id
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Scraping job queued successfully'
    });

  } catch {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to create scraping job', { error });
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
