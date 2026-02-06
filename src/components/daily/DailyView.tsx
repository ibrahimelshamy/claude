import { useState, useMemo } from 'react';
import { useAppState } from '../../hooks/use-app-state';
import { DaySelector } from './DaySelector';
import { TimeEntryRow } from './TimeEntryRow';
import { TimeEntryForm } from './TimeEntryForm';
import { DaySummary } from './DaySummary';

export function DailyView() {
  const { state } = useAppState();
  const [showForm, setShowForm] = useState(false);

  const dayEntries = useMemo(() => {
    return state.entries
      .filter(e => e.date === state.selectedDate)
      .sort((a, b) => {
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [state.entries, state.selectedDate]);

  const matterMap = useMemo(() => {
    return new Map(state.matters.map(m => [m.id, m]));
  }, [state.matters]);

  return (
    <div className="daily-view">
      <DaySelector />

      <div className="daily-entries">
        {dayEntries.length === 0 && !showForm ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128337;</div>
            <h3>No entries for this day</h3>
            <p>Add a time entry to start tracking your work.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add Entry
            </button>
          </div>
        ) : (
          <>
            <div className="entries-header">
              <span>Matter</span>
              <span>Description</span>
              <span>Time</span>
              <span>Hours</span>
              <span></span>
              <span></span>
            </div>
            {dayEntries.map(entry => (
              <TimeEntryRow
                key={entry.id}
                entry={entry}
                matter={matterMap.get(entry.matterId)}
              />
            ))}
          </>
        )}

        {showForm ? (
          <TimeEntryForm onClose={() => setShowForm(false)} />
        ) : dayEntries.length > 0 ? (
          <button className="btn btn-add-entry" onClick={() => setShowForm(true)}>
            + Add Entry
          </button>
        ) : null}
      </div>

      {dayEntries.length > 0 && <DaySummary />}
    </div>
  );
}
