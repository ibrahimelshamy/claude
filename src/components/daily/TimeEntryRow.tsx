import { useState } from 'react';
import type { TimeEntry, ClientMatter } from '../../types';
import { useAppState } from '../../hooks/use-app-state';
import { useTimer } from '../../hooks/use-timer';
import { formatTimeOfDay, formatHoursDecimal } from '../../utils/time';
import { TimeEntryForm } from './TimeEntryForm';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface TimeEntryRowProps {
  entry: TimeEntry;
  matter: ClientMatter | undefined;
}

export function TimeEntryRow({ entry, matter }: TimeEntryRowProps) {
  const { dispatch } = useAppState();
  const { isRunning, activeEntry, startTimer } = useTimer();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isActive = isRunning && activeEntry?.id === entry.id;

  const handleDelete = () => {
    dispatch({ type: 'DELETE_ENTRY', payload: { id: entry.id } });
    setConfirmDelete(false);
  };

  const handleStartTimer = () => {
    if (matter) {
      startTimer(matter.id, entry.description, entry.date);
    }
  };

  if (editing) {
    return (
      <TimeEntryForm
        entry={entry}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <div className={`entry-row ${isActive ? 'entry-row-active' : ''} ${!entry.billable ? 'entry-row-nonbillable' : ''}`}>
        <div className="entry-row-matter">
          <span className="entry-matter-number">{matter?.matterNumber || '—'}</span>
          <span className="entry-client-name">{matter?.clientName || 'Unknown'}</span>
        </div>
        <div className="entry-row-description">{entry.description || '(no description)'}</div>
        <div className="entry-row-times">
          <span>{formatTimeOfDay(entry.startTime)}</span>
          <span className="entry-time-sep">–</span>
          <span>{entry.endTime ? formatTimeOfDay(entry.endTime) : (isActive ? 'running' : '—')}</span>
        </div>
        <div className="entry-row-hours">{formatHoursDecimal(entry.durationMinutes)}h</div>
        <div className="entry-row-billable">
          <span className={`badge ${entry.billable ? 'badge-billable' : 'badge-nonbillable'}`}>
            {entry.billable ? 'B' : 'NB'}
          </span>
        </div>
        <div className="entry-row-actions">
          {!isActive && (
            <button className="btn btn-icon btn-play" onClick={handleStartTimer} title="Start timer on this matter">
              &#9654;
            </button>
          )}
          <button className="btn btn-icon" onClick={() => setEditing(true)} title="Edit">
            &#9998;
          </button>
          <button className="btn btn-icon btn-delete" onClick={() => setConfirmDelete(true)} title="Delete">
            &times;
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this time entry?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
