export interface GoalConfig {
  monthlyHoursTarget: number;
  workingDaysPerWeek: number;
}

export interface InsightMetrics {
  currentMonthTotalMinutes: number;
  currentMonthBillableMinutes: number;
  currentMonthWorkingDaysPassed: number;
  currentMonthWorkingDaysRemaining: number;
  dailyAverageMinutes: number;
  requiredDailyMinutes: number;
  projectedMonthEndMinutes: number;
  onTrack: boolean;
  topMatters: MatterInsight[];
  weeklyTotals: WeeklyTotal[];
}

export interface MatterInsight {
  matterId: string;
  clientName: string;
  matterName: string;
  matterNumber: string;
  totalMinutes: number;
  percentageOfTotal: number;
}

export interface WeeklyTotal {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalMinutes: number;
  billableMinutes: number;
  dayCount: number;
}
