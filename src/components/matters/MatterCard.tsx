import { useState, useMemo } from 'react';
import type { ClientMatter } from '../../types';
import { useAppState } from '../../hooks/use-app-state';
import { useTimer } from '../../hooks/use-timer';
import { formatHoursDecimal } from '../../utils/time';
import { MatterForm } from './MatterForm';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface MatterCardProps {
  matter: ClientMatter;
}

export function MatterCard({ matter }: MatterCardProps) {
  const { state, dispatch } = useAppState();
  const { startTimer } = useTimer();
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const totalMinutes = useMemo(() => {
    return state.entries
      .filter(e => e.matterId === matter.id)
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [state.entries, matter.id]);

  const handleArchive = () => {
    dispatch({ type: 'DELETE_MATTER', payload: { id: matter.id } });
    setConfirmArchive(false);
  };

  const handleQuickTimer = () => {
    startTimer(matter.id, '', state.selectedDate);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'daily' });
  };

  return (
    <>
      <div className={`matter-card ${matter.status !== 'active' ? 'matter-card-inactive' : ''}`}>
        <div className="matter-card-main">
          <div className="matter-card-header">
            <span className="matter-card-number">{matter.matterNumber}</span>
            <span className={`badge badge-status badge-${matter.status}`}>{matter.status}</span>
          </div>
          <div className="matter-card-client">{matter.clientName}</div>
          <div className="matter-card-name">{matter.matterName}</div>
          {matter.notes && <div className="matter-card-notes">{matter.notes}</div>}
        </div>
        <div className="matter-card-stats">
          <div className="matter-card-stat">
            <span className="matter-card-stat-value">{formatHoursDecimal(totalMinutes)}h</span>
            <span className="matter-card-stat-label">Total</span>
          </div>
          {matter.billableRate && (
            <div className="matter-card-stat">
              <span className="matter-card-stat-value">${matter.billableRate}/hr</span>
              <span className="matter-card-stat-label">Rate</span>
            </div>
          )}
        </div>
        <div className="matter-card-actions">
          <button className="btn btn-icon btn-play" onClick={handleQuickTimer} title="Start timer">
            &#9654;
          </button>
          <button className="btn btn-icon" onClick={() => setEditing(true)} title="Edit">
            &#9998;
          </button>
          {matter.status !== 'archived' && (
            <button className="btn btn-icon btn-delete" onClick={() => setConfirmArchive(true)} title="Archive">
              &#128451;
            </button>
          )}
        </div>
      </div>
      <MatterForm matter={matter} isOpen={editing} onClose={() => setEditing(false)} />
      <ConfirmDialog
        isOpen={confirmArchive}
        title="Archive Matter"
        message={`Archive "${matter.matterNumber} - ${matter.clientName}"? It will no longer appear in active searches.`}
        confirmLabel="Archive"
        variant="danger"
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </>
  );
}
