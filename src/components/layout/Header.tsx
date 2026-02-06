import { useTimer } from '../../hooks/use-timer';
import { formatTimerDisplay } from '../../utils/time';

export function Header() {
  const { isRunning, displayMs, activeMatter } = useTimer();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">TimeKeeper</h1>
        <span className="header-subtitle">Professional Time Tracking</span>
      </div>
      {isRunning && (
        <div className="header-timer-badge">
          <span className="timer-dot" />
          <span className="timer-badge-matter">{activeMatter?.matterNumber || 'Timer'}</span>
          <span className="timer-badge-time">{formatTimerDisplay(displayMs)}</span>
        </div>
      )}
    </header>
  );
}
