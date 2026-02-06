import { useState } from 'react';
import type { TimeEntry } from '../../types';
import { useAppState } from '../../hooks/use-app-state';
import { useTimer } from '../../hooks/use-timer';
import { MatterSelect } from '../shared/MatterSelect';

interface TimeEntryFormProps {
  entry?: TimeEntry;
  onClose: () => void;
  date?: string;
}

export function TimeEntryForm({ entry, onClose, date }: TimeEntryFormProps) {
  const { state, dispatch } = useAppState();
  const { startTimer } = useTimer();
  const isEdit = !!entry;

  const [matterId, setMatterId] = useState(entry?.matterId || '');
  const [description, setDescription] = useState(entry?.description || '');
  const [hours, setHours] = useState(entry ? String(entry.durationMinutes / 60) : '');
  const [billable, setBillable] = useState(entry?.billable ?? true);
  const [entryType, setEntryType] = useState<'manual' | 'timer'>(entry?.entryType || 'manual');

  const effectiveDate = date || entry?.date || state.selectedDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterId) return;

    if (entryType === 'timer' && !isEdit) {
      startTimer(matterId, description, effectiveDate);
      onClose();
      return;
    }

    const durationMinutes = Math.round(parseFloat(hours || '0') * 60);
    const now = new Date().toISOString();

    if (isEdit && entry) {
      dispatch({
        type: 'UPDATE_ENTRY',
        payload: {
          ...entry,
          matterId,
          description,
          durationMinutes,
          billable,
          updatedAt: now,
        },
      });
    } else {
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        matterId,
        date: effectiveDate,
        description,
        startTime: null,
        endTime: null,
        durationMinutes,
        entryType: 'manual',
        billable,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    }
    onClose();
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="entry-form-grid">
        <div className="form-group form-group-matter">
          <label>Client-Matter</label>
          <MatterSelect value={matterId} onChange={setMatterId} />
        </div>
        <div className="form-group form-group-desc">
          <label>Description</label>
          <input
            type="text"
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Work performed..."
          />
        </div>
        {!isEdit && (
          <div className="form-group form-group-type">
            <label>Type</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${entryType === 'manual' ? 'active' : ''}`}
                onClick={() => setEntryType('manual')}
              >
                Manual
              </button>
              <button
                type="button"
                className={`toggle-btn ${entryType === 'timer' ? 'active' : ''}`}
                onClick={() => setEntryType('timer')}
              >
                Timer
              </button>
            </div>
          </div>
        )}
        {(entryType === 'manual' || isEdit) && (
          <div className="form-group form-group-hours">
            <label>Hours</label>
            <input
              type="number"
              className="input"
              value={hours}
              onChange={e => setHours(e.target.value)}
              step="0.1"
              min="0"
              max="24"
              placeholder="0.0"
            />
          </div>
        )}
        <div className="form-group form-group-billable">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={billable}
              onChange={e => setBillable(e.target.checked)}
            />
            Billable
          </label>
        </div>
      </div>
      <div className="entry-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!matterId}>
          {isEdit ? 'Update' : entryType === 'timer' ? 'Start Timer' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}
