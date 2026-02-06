import { useMemo } from 'react';
import { useAppState } from './use-app-state';
import type { InsightMetrics, MatterInsight, WeeklyTotal } from '../types';
import { formatDate, startOfMonth, endOfMonth, countWorkingDays, getMonthWeeks } from '../utils/date';

export function useInsights(): InsightMetrics {
  const { state } = useAppState();

  return useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);
    const mStartStr = formatDate(mStart);
    const mEndStr = formatDate(mEnd);

    const monthEntries = state.entries.filter(
      e => e.date >= mStartStr && e.date <= mEndStr
    );

    const totalMinutes = monthEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const billableMinutes = monthEntries
      .filter(e => e.billable)
      .reduce((sum, e) => sum + e.durationMinutes, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workingDaysPassed = countWorkingDays(mStart, today);
    const workingDaysRemaining = countWorkingDays(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      mEnd
    );

    const dailyAvg = workingDaysPassed > 0 ? totalMinutes / workingDaysPassed : 0;
    const targetMinutes = state.goalConfig.monthlyHoursTarget * 60;
    const remainingMinutes = targetMinutes - totalMinutes;
    const requiredDaily = workingDaysRemaining > 0 ? remainingMinutes / workingDaysRemaining : 0;
    const totalWorkingDays = workingDaysPassed + workingDaysRemaining;
    const projected = totalWorkingDays > 0 ? dailyAvg * totalWorkingDays : totalMinutes;

    // Top matters
    const matterMinutes = new Map<string, number>();
    monthEntries.forEach(e => {
      matterMinutes.set(e.matterId, (matterMinutes.get(e.matterId) || 0) + e.durationMinutes);
    });

    const topMatters: MatterInsight[] = Array.from(matterMinutes.entries())
      .map(([matterId, mins]) => {
        const matter = state.matters.find(m => m.id === matterId);
        return {
          matterId,
          clientName: matter?.clientName || 'Unknown',
          matterName: matter?.matterName || 'Unknown',
          matterNumber: matter?.matterNumber || '',
          totalMinutes: mins,
          percentageOfTotal: totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0,
        };
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    // Weekly totals
    const weeks = getMonthWeeks(now.getFullYear(), now.getMonth());
    const weeklyTotals: WeeklyTotal[] = weeks.map(w => {
      const weekEntries = monthEntries.filter(
        e => e.date >= w.start && e.date <= w.end
      );
      const wTotal = weekEntries.reduce((s, e) => s + e.durationMinutes, 0);
      const wBillable = weekEntries.filter(e => e.billable).reduce((s, e) => s + e.durationMinutes, 0);

      // Count actual days with entries in this week
      const daysWithEntries = new Set(weekEntries.map(e => e.date)).size;

      return {
        weekNumber: w.weekNum,
        startDate: w.start,
        endDate: w.end,
        totalMinutes: wTotal,
        billableMinutes: wBillable,
        dayCount: daysWithEntries,
      };
    });

    return {
      currentMonthTotalMinutes: totalMinutes,
      currentMonthBillableMinutes: billableMinutes,
      currentMonthWorkingDaysPassed: workingDaysPassed,
      currentMonthWorkingDaysRemaining: workingDaysRemaining,
      dailyAverageMinutes: dailyAvg,
      requiredDailyMinutes: Math.max(0, requiredDaily),
      projectedMonthEndMinutes: projected,
      onTrack: projected >= targetMinutes,
      topMatters,
      weeklyTotals,
    };
  }, [state.entries, state.matters, state.goalConfig]);
}
