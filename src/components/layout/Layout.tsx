import { useAppState } from '../../hooks/use-app-state';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { DailyView } from '../daily/DailyView';
import { MattersView } from '../matters/MattersView';
import { InsightsView } from '../insights/InsightsView';
import { ExportView } from '../export/ExportView';
import { ActiveTimer } from '../daily/ActiveTimer';

export function Layout() {
  const { state } = useAppState();

  const renderView = () => {
    switch (state.activeTab) {
      case 'daily':
        return <DailyView />;
      case 'matters':
        return <MattersView />;
      case 'insights':
        return <InsightsView />;
      case 'export':
        return <ExportView />;
    }
  };

  return (
    <div className="layout">
      <Header />
      <TabBar />
      <main className="layout-content">{renderView()}</main>
      {state.timer.isRunning && <ActiveTimer />}
    </div>
  );
}
