import { useMemo } from 'react';
import { useAppState } from '../../hooks/use-app-state';
import { formatHoursDecimal, formatDuration } from '../../utils/time';

export function DaySummary() {
  const { state } = useAppState();

  const summary = useMemo(() => {
    const dayEntries = state.entries.filter(e => e.date === state.selectedDate);
    const totalMinutes = dayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const billableMinutes = dayEntries.filter(e => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0);
    const nonBillableMinutes = totalMinutes - billableMinutes;
    const entryCount = dayEntries.length;

    // Group by matter
    const byMatter = new Map<string, number>();
    dayEntries.forEach(e => {
      byMatter.set(e.matterId, (byMatter.get(e.matterId) || 0) + e.durationMinutes);
    });

    return {
      totalMinutes,
      billableMinutes,
      nonBillableMinutes,
      entryCount,
      matterCount: byMatter.size,
    };
  }, [state.entries, state.selectedDate]);

  return (
    <div className="day-summary">
      <div className="day-summary-stat">
        <span className="day-summary-label">Total</span>
        <span className="day-summary-value">{formatHoursDecimal(summary.totalMinutes)}h</span>
        <span className="day-summary-detail">{formatDuration(summary.totalMinutes)}</span>
      </div>
      <div className="day-summary-stat">
        <span className="day-summary-label">Billable</span>
        <span className="day-summary-value billable">{formatHoursDecimal(summary.billableMinutes)}h</span>
      </div>
      <div className="day-summary-stat">
        <span className="day-summary-label">Non-Billable</span>
        <span className="day-summary-value">{formatHoursDecimal(summary.nonBillableMinutes)}h</span>
      </div>
      <div className="day-summary-stat">
        <span className="day-summary-label">Entries</span>
        <span className="day-summary-value">{summary.entryCount}</span>
      </div>
      <div className="day-summary-stat">
        <span className="day-summary-label">Matters</span>
        <span className="day-summary-value">{summary.matterCount}</span>
      </div>
    </div>
  );
}
