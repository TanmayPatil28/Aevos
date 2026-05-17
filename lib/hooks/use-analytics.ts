import useSWR from 'swr';
import type { IntelligenceApiResponse, PredictionOutput } from '@/core/types';
import type { RiskAnalysisResult, TrajectoryAnalysis } from '@/core';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch analytics');
  }
  return res.json();
};

export function useForecast() {
  const { data, error, isLoading, mutate } = useSWR<
    IntelligenceApiResponse<Omit<PredictionOutput, 'explanation'>>
  >('/api/analytics/forecast', fetcher);

  return {
    forecast: data?.data,
    metadata: data?.metadata,
    explainability: data?.explainability,
    error,
    isLoading,
    mutate,
  };
}

export function useRisk() {
  const { data, error, isLoading, mutate } = useSWR<IntelligenceApiResponse<RiskAnalysisResult>>(
    '/api/analytics/risk',
    fetcher
  );

  return {
    risk: data?.data,
    metadata: data?.metadata,
    explainability: data?.explainability,
    error,
    isLoading,
    mutate,
  };
}

export function useTrajectory() {
  const { data, error, isLoading, mutate } = useSWR<IntelligenceApiResponse<TrajectoryAnalysis>>(
    '/api/analytics/trajectory',
    fetcher
  );

  return {
    trajectory: data?.data,
    metadata: data?.metadata,
    explainability: data?.explainability,
    error,
    isLoading,
    mutate,
  };
}

export function useGraduationProgress() {
  const { data, error, isLoading, mutate } = useSWR<
    IntelligenceApiResponse<{
      exitOptions: any[];
      earnedCredits: number;
      completedSemesters: number;
      highestEligibleTitle?: string;
    }>
  >('/api/graduation/progress', fetcher);

  return {
    graduation: data?.data,
    metadata: data?.metadata,
    explainability: data?.explainability,
    error,
    isLoading,
    mutate,
  };
}
