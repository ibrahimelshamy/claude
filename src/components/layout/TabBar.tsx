import { useAppState } from '../../hooks/use-app-state';
import type { AppState } from '../../context/app-reducer';

const tabs: { id: AppState['activeTab']; label: string }[] = [
  { id: 'daily', label: 'Daily Timesheet' },
  { id: 'matters', label: 'Client Matters' },
  { id: 'insights', label: 'Insights' },
  { id: 'export', label: 'Export' },
];

export function TabBar() {
  const { state, dispatch } = useAppState();

  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${state.activeTab === tab.id ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
