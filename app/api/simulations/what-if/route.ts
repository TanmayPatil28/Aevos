import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentFeatureVector } from '@/lib/analytics/feature-loader';
import { WhatIfEngine } from '@/core';
import type { WhatIfResult } from '@/core';
import { z } from 'zod';
import type { IntelligenceApiResponse } from '@/core/types';

const whatIfSchema = z.object({
  simulatedSgpa: z.number().min(0).max(10),
  simulatedSemesterCredits: z.number().min(1).max(30),
  targetCgpa: z.number().min(0).max(10).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as IntelligenceApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = whatIfSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload' } as IntelligenceApiResponse<null>,
        { status: 400 }
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

    const { simulatedSgpa, simulatedSemesterCredits, targetCgpa } = result.data;

    const simulation: WhatIfResult = WhatIfEngine.simulateCgpaImpact(
      {
        currentCgpa: features.currentCgpa,
        totalCreditsCompleted: features.creditsCompleted,
        simulatedSemesterCredits,
        simulatedSgpa,
      },
      targetCgpa
    );

    // Compute required SGPA if a target CGPA is specified
    let requiredSgpa: number | 'impossible' | undefined;
    if (targetCgpa) {
      requiredSgpa = WhatIfEngine.calculateRequiredSgpa(
        features.currentCgpa,
        features.creditsCompleted,
        targetCgpa,
        simulatedSemesterCredits
      );
    }

    const response: IntelligenceApiResponse<
      WhatIfResult & { requiredSgpa?: number | 'impossible' }
    > = {
      success: true,
      data: {
        ...simulation,
        requiredSgpa,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
      explainability: {
        factors: [
          `Current CGPA: ${features.currentCgpa} (${features.creditsCompleted} credits)`,
          `Simulated Semester: ${simulatedSgpa} SGPA (${simulatedSemesterCredits} credits)`,
          `Projected CGPA will become ${simulation.newCgpa} (Delta: ${simulation.cgpaDelta > 0 ? '+' : ''}${simulation.cgpaDelta})`,
          targetCgpa
            ? requiredSgpa === 'impossible'
              ? `Note: Reaching a target CGPA of ${targetCgpa} in this semester is mathematically impossible.`
              : `To reach your target CGPA of ${targetCgpa}, you need to score at least ${requiredSgpa} SGPA.`
            : '',
        ].filter(Boolean),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_WHATIF_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      } as IntelligenceApiResponse<null>,
      { status: 500 }
    );
  }
}
