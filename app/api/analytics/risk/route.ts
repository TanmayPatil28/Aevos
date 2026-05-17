import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentFeatureVector } from '@/lib/analytics/feature-loader';
import { DropoutRiskEngine } from '@/core';
import type { RiskAnalysisResult } from '@/core';
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

    const risk: RiskAnalysisResult = DropoutRiskEngine.analyze(features);

    // Dynamic recovery recommendations
    const recommendations: string[] = [];
    if (risk.level === 'critical' || risk.level === 'high') {
      recommendations.push(
        'Prioritize clearing active backlogs immediately to avoid progression blocks.'
      );
      recommendations.push('Ensure your attendance rate stays above the mandatory 75% threshold.');
    } else if (risk.level === 'medium') {
      recommendations.push(
        'Try to improve attendance and secure consistent internal marks in upcoming semesters.'
      );
    } else {
      recommendations.push('Keep up the great work! Your academic trajectory is highly stable.');
    }

    const response: IntelligenceApiResponse<RiskAnalysisResult> = {
      success: true,
      data: risk,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
      explainability: {
        factors: [...risk.riskFactors],
        recommendations,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_RISK_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      } as IntelligenceApiResponse<null>,
      { status: 500 }
    );
  }
}
