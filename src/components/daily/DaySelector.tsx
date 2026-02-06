import { useAppState } from '../../hooks/use-app-state';
import { formatDisplayDate, addDays, todayStr } from '../../utils/date';

export function DaySelector() {
  const { state, dispatch } = useAppState();
  const { selectedDate } = state;
  const today = todayStr();
  const isToday = selectedDate === today;

  return (
    <div className="day-selector">
      <button
        className="btn btn-icon"
        onClick={() => dispatch({ type: 'SET_SELECTED_DATE', payload: addDays(selectedDate, -1) })}
        aria-label="Previous day"
      >
        &#8249;
      </button>
      <div className="day-selector-display">
        <span className="day-selector-date">{formatDisplayDate(selectedDate)}</span>
        {isToday && <span className="day-selector-today-badge">Today</span>}
      </div>
      <button
        className="btn btn-icon"
        onClick={() => dispatch({ type: 'SET_SELECTED_DATE', payload: addDays(selectedDate, 1) })}
        aria-label="Next day"
      >
        &#8250;
      </button>
      {!isToday && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch({ type: 'SET_SELECTED_DATE', payload: today })}
        >
          Today
        </button>
      )}
    </div>
  );
}
