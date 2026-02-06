import { AppProvider } from './context/app-context';
import { Layout } from './components/layout/Layout';

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
