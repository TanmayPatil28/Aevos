import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentFeatureVector } from '@/lib/analytics/feature-loader';
import { NEPEngine } from '@/core';
import type { IntelligenceApiResponse, NepExitCertification } from '@/core/types';

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

    const exits: NepExitCertification[] = NEPEngine.evaluateExitOptions(features);

    // Filter to find highest eligible exit
    const highestEligible = exits.filter((e) => e.eligible).pop();

    const response: IntelligenceApiResponse<{
      exitOptions: readonly NepExitCertification[];
      earnedCredits: number;
      completedSemesters: number;
      highestEligibleTitle?: string;
    }> = {
      success: true,
      data: {
        exitOptions: exits,
        earnedCredits: features.creditsCompleted,
        completedSemesters: features.semestersCompleted,
        highestEligibleTitle: highestEligible?.title || 'None yet (Requires 1 full academic year)',
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
      explainability: {
        factors: [
          `Completed ${features.semestersCompleted} semesters.`,
          `Earned ${features.creditsCompleted} total credits.`,
          features.backlogCount > 0
            ? `Active backlogs (${features.backlogCount}) prevent graduation exits.`
            : 'No active backlogs block your graduation profile.',
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_GRADUATION_PROGRESS_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      } as IntelligenceApiResponse<null>,
      { status: 500 }
    );
  }
}
