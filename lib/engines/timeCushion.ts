/**
 * The Time Liquidity Engine - Time Cushion Algorithm
 * Calculates the delta between total available waking hours and required academic/task hours.
 */

export interface Task {
  id: string;
  title: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TimeCushionParams {
  totalWakingHours: number; // e.g., 16 hours per day * 7 days = 112
  scheduledClassHours: number; // e.g., 20 hours of classes this week
  commuteHours: number; // e.g., 5 hours
  maintenanceHours: number; // e.g., eating, showering, gym (e.g., 14 hours)
  tasks: Task[]; // Assignments, Hackathons, etc.
}

export interface TimeCushionResult {
  totalAvailableHours: number; // Raw free hours before tasks
  totalRequiredTaskHours: number;
  cushion: number; // Positive means free time, negative means burnout/debt
  internalImpactRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export function calculateTimeCushion(params: TimeCushionParams): TimeCushionResult {
  // 1. Calculate base free time (gross liquidity)
  const totalAvailableHours = Math.max(
    0, 
    params.totalWakingHours - params.scheduledClassHours - params.commuteHours - params.maintenanceHours
  );

  // 2. Sum up all task estimates (liabilities)
  const totalRequiredTaskHours = params.tasks.reduce((acc, task) => {
    // Add a slight multiplier for high/critical priority to account for stress/overrun
    let multiplier = 1.0;
    if (task.priority === 'high') multiplier = 1.1;
    if (task.priority === 'critical') multiplier = 1.25;
    
    return acc + (task.estimatedHours * multiplier);
  }, 0);

  // 3. The Cushion (net liquidity)
  const cushion = totalAvailableHours - totalRequiredTaskHours;

  // 4. Calculate Risk
  let internalImpactRisk: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  
  // If cushion is negative, they are in time debt. 
  if (cushion < 0) {
    internalImpactRisk = 'Critical';
  } else if (cushion < 10) {
    // Less than 10 hours of free time for the whole week
    internalImpactRisk = 'High';
  } else if (cushion < 25) {
    internalImpactRisk = 'Moderate';
  } else {
    internalImpactRisk = 'Low';
  }

  return {
    totalAvailableHours: Number(totalAvailableHours.toFixed(1)),
    totalRequiredTaskHours: Number(totalRequiredTaskHours.toFixed(1)),
    cushion: Number(cushion.toFixed(1)),
    internalImpactRisk
  };
}
