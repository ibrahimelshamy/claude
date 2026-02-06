import { useState } from 'react';
import { useInsights } from '../../hooks/use-insights';
import { useAppState } from '../../hooks/use-app-state';
import { formatHoursDecimal, formatDuration } from '../../utils/time';

export function InsightsView() {
  const { state, dispatch } = useAppState();
  const insights = useInsights();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(state.goalConfig.monthlyHoursTarget));

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const progressPct = state.goalConfig.monthlyHoursTarget > 0
    ? Math.min(100, (insights.currentMonthTotalMinutes / 60 / state.goalConfig.monthlyHoursTarget) * 100)
    : 0;

  const handleSaveGoal = () => {
    const val = parseFloat(goalInput);
    if (val > 0) {
      dispatch({
        type: 'SET_GOAL_CONFIG',
        payload: { ...state.goalConfig, monthlyHoursTarget: val },
      });
    }
    setEditingGoal(false);
  };

  return (
    <div className="insights-view">
      <div className="insights-header">
        <h2>{monthName}</h2>
        <div className="insights-goal">
          {editingGoal ? (
            <div className="goal-edit">
              <input
                type="number"
                className="input input-sm"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                min="1"
                step="1"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveGoal();
                  if (e.key === 'Escape') setEditingGoal(false);
                }}
              />
              <span>hours/month</span>
              <button className="btn btn-primary btn-sm" onClick={handleSaveGoal}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingGoal(false)}>Cancel</button>
            </div>
          ) : (
            <button className="goal-display" onClick={() => setEditingGoal(true)}>
              Goal: {state.goalConfig.monthlyHoursTarget}h/month &#9998;
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-card">
        <div className="progress-bar-container">
          <div
            className={`progress-bar-fill ${insights.onTrack ? 'on-track' : 'behind'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="progress-stats">
          <span className="progress-current">
            {formatHoursDecimal(insights.currentMonthTotalMinutes)}h logged
          </span>
          <span className="progress-pct">{progressPct.toFixed(1)}%</span>
          <span className="progress-target">
            of {state.goalConfig.monthlyHoursTarget}h goal
          </span>
        </div>
        <div className="progress-billable">
          Billable: {formatHoursDecimal(insights.currentMonthBillableMinutes)}h
          {insights.currentMonthTotalMinutes > 0 && (
            <span> ({((insights.currentMonthBillableMinutes / insights.currentMonthTotalMinutes) * 100).toFixed(0)}%)</span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{formatHoursDecimal(insights.dailyAverageMinutes)}</div>
          <div className="metric-label">Avg Hours/Day</div>
          <div className="metric-detail">{formatDuration(insights.dailyAverageMinutes)} per working day</div>
        </div>
        <div className="metric-card">
          <div className={`metric-value ${insights.requiredDailyMinutes > insights.dailyAverageMinutes * 1.5 ? 'text-danger' : ''}`}>
            {formatHoursDecimal(insights.requiredDailyMinutes)}
          </div>
          <div className="metric-label">Needed Hours/Day</div>
          <div className="metric-detail">To reach {state.goalConfig.monthlyHoursTarget}h goal</div>
        </div>
        <div className={`metric-card ${insights.onTrack ? 'metric-card-success' : 'metric-card-warning'}`}>
          <div className="metric-value">{formatHoursDecimal(insights.projectedMonthEndMinutes)}</div>
          <div className="metric-label">Projected Total</div>
          <div className="metric-detail">
            {insights.onTrack ? 'On track' : 'Behind pace'} — {insights.currentMonthWorkingDaysRemaining} working days left
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{insights.currentMonthWorkingDaysPassed}</div>
          <div className="metric-label">Working Days Passed</div>
          <div className="metric-detail">{insights.currentMonthWorkingDaysRemaining} remaining this month</div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      {insights.weeklyTotals.length > 0 && (
        <div className="insights-section">
          <h3>Weekly Breakdown</h3>
          <div className="weekly-grid">
            {insights.weeklyTotals.map(w => (
              <div key={w.weekNumber} className="weekly-card">
                <div className="weekly-header">Week {w.weekNumber}</div>
                <div className="weekly-dates">
                  {new Date(w.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' – '}
                  {new Date(w.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="weekly-hours">{formatHoursDecimal(w.totalMinutes)}h</div>
                <div className="weekly-detail">
                  {formatHoursDecimal(w.billableMinutes)}h billable · {w.dayCount} days
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Matters */}
      {insights.topMatters.length > 0 && (
        <div className="insights-section">
          <h3>Top Matters This Month</h3>
          <div className="top-matters-table">
            <div className="top-matters-header">
              <span>Matter</span>
              <span>Client</span>
              <span>Hours</span>
              <span>%</span>
            </div>
            {insights.topMatters.slice(0, 15).map(m => (
              <div key={m.matterId} className="top-matters-row">
                <span className="top-matter-number">{m.matterNumber}</span>
                <span className="top-matter-client">{m.clientName}</span>
                <span className="top-matter-hours">{formatHoursDecimal(m.totalMinutes)}h</span>
                <span className="top-matter-pct">
                  <span
                    className="pct-bar"
                    style={{ width: `${Math.min(100, m.percentageOfTotal)}%` }}
                  />
                  {m.percentageOfTotal.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.topMatters.length === 0 && insights.weeklyTotals.every(w => w.totalMinutes === 0) && (
        <div className="empty-state">
          <div className="empty-state-icon">&#128200;</div>
          <h3>No data yet this month</h3>
          <p>Start logging time entries to see your insights and progress toward your monthly goal.</p>
        </div>
      )}
    </div>
  );
}
