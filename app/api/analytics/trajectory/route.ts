import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentFeatureVector } from '@/lib/analytics/feature-loader';
import { TrajectoryAnalyzer } from '@/core';
import type { TrajectoryAnalysis } from '@/core';
import type { IntelligenceApiResponse } from '@/core/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as IntelligenceApiResponse<null>,
        { status: 401 }
      );
    }

    const features = await getStudentFeatureVector(session.user.id);
    if (!features) {
      return NextResponse.json(
        {
          success: false,
          error: 'User profile not found. Please complete onboarding first.',
        } as IntelligenceApiResponse<null>,
        { status: 404 }
      );
    }

    const trajectory: TrajectoryAnalysis = TrajectoryAnalyzer.analyze(features.historicalSgpas);

    const response: IntelligenceApiResponse<TrajectoryAnalysis> = {
      success: true,
      data: trajectory,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
      explainability: {
        factors: [...trajectory.insights],
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_TRAJECTORY_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      } as IntelligenceApiResponse<null>,
      { status: 500 }
    );
  }
}
