import type { ClientMatter, TimeEntry, GoalConfig } from '../types';
import type { AppState } from './app-reducer';

export type AppAction =
  | { type: 'ADD_MATTER'; payload: ClientMatter }
  | { type: 'UPDATE_MATTER'; payload: ClientMatter }
  | { type: 'DELETE_MATTER'; payload: { id: string } }
  | { type: 'ADD_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'START_TIMER'; payload: { entryId: string; startedAt: string } }
  | { type: 'STOP_TIMER'; payload: { entryId: string; durationMinutes: number; endTime: string } }
  | { type: 'DISCARD_TIMER' }
  | { type: 'SET_GOAL_CONFIG'; payload: GoalConfig }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'HYDRATE'; payload: AppState };
