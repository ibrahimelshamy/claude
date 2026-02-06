import { createContext, useReducer, useEffect } from 'react';
import type { AppState } from './app-reducer';
import { appReducer, initialState } from './app-reducer';
import type { AppAction } from './actions';
import { loadState, saveState } from '../utils/storage';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const persisted = loadState();
    if (persisted) {
      return {
        ...persisted,
        selectedDate: new Date().toISOString().split('T')[0],
        activeTab: persisted.activeTab || 'daily',
      };
    }
    return initial;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
