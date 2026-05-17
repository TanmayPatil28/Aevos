import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentFeatureVector } from '@/lib/analytics/feature-loader';
import { PredictionPipeline } from '@/core';
import type { IntelligenceApiResponse, PredictionOutput } from '@/core/types';

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

    // Run prediction for next semester (current + 1)
    const targetSemester = features.semestersCompleted + 1;
    const prediction: PredictionOutput = await PredictionPipeline.run(features, targetSemester);

    const response: IntelligenceApiResponse<Omit<PredictionOutput, 'explanation'>> = {
      success: true,
      data: {
        predictedSgpa: prediction.predictedSgpa,
        predictedCgpa: prediction.predictedCgpa,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        confidence: prediction.confidence,
      },
      explainability: {
        factors: prediction.explanation.featureImportance.map(
          (f) =>
            `${f.feature} has a ${f.direction} impact (importance: ${Math.round(f.importance * 100)}%)`
        ),
        recommendations: prediction.recommendations,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_FORECAST_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      } as IntelligenceApiResponse<null>,
      { status: 500 }
    );
  }
}
