import { useTimer } from '../../hooks/use-timer';
import { formatTimerDisplay } from '../../utils/time';

export function ActiveTimer() {
  const { displayMs, isRunning, activeEntry, activeMatter, stopTimer, discardTimer } = useTimer();

  if (!isRunning || !activeEntry) return null;

  return (
    <div className="active-timer">
      <div className="active-timer-info">
        <span className="timer-dot" />
        <div className="active-timer-details">
          <span className="active-timer-matter">
            {activeMatter?.matterNumber || '—'} — {activeMatter?.clientName || 'Unknown'}
          </span>
          <span className="active-timer-desc">{activeEntry.description || '(no description)'}</span>
        </div>
      </div>
      <div className="active-timer-display">
        {formatTimerDisplay(displayMs)}
      </div>
      <div className="active-timer-actions">
        <button className="btn btn-danger btn-sm" onClick={discardTimer}>
          Discard
        </button>
        <button className="btn btn-primary btn-sm" onClick={stopTimer}>
          Stop
        </button>
      </div>
    </div>
  );
}
