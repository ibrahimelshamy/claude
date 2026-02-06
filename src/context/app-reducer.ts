import type { ClientMatter, TimeEntry, TimerState, GoalConfig } from '../types';
import type { AppAction } from './actions';

export interface AppState {
  matters: ClientMatter[];
  entries: TimeEntry[];
  timer: TimerState;
  goalConfig: GoalConfig;
  selectedDate: string;
  activeTab: 'daily' | 'matters' | 'insights' | 'export';
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const initialState: AppState = {
  matters: [],
  entries: [],
  timer: {
    isRunning: false,
    activeEntryId: null,
    startedAt: null,
    accumulatedMs: 0,
  },
  goalConfig: {
    monthlyHoursTarget: 180,
    workingDaysPerWeek: 5,
  },
  selectedDate: todayStr(),
  activeTab: 'daily',
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MATTER':
      return { ...state, matters: [...state.matters, action.payload] };

    case 'UPDATE_MATTER':
      return {
        ...state,
        matters: state.matters.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'DELETE_MATTER':
      return {
        ...state,
        matters: state.matters.map(m =>
          m.id === action.payload.id ? { ...m, status: 'archived' as const } : m
        ),
      };

    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };

    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== action.payload.id),
      };

    case 'START_TIMER':
      return {
        ...state,
        timer: {
          isRunning: true,
          activeEntryId: action.payload.entryId,
          startedAt: action.payload.startedAt,
          accumulatedMs: 0,
        },
      };

    case 'STOP_TIMER': {
      const updatedEntries = state.entries.map(e =>
        e.id === action.payload.entryId
          ? {
              ...e,
              durationMinutes: action.payload.durationMinutes,
              endTime: action.payload.endTime,
              updatedAt: new Date().toISOString(),
            }
          : e
      );
      return {
        ...state,
        entries: updatedEntries,
        timer: {
          isRunning: false,
          activeEntryId: null,
          startedAt: null,
          accumulatedMs: 0,
        },
      };
    }

    case 'DISCARD_TIMER': {
      const entryId = state.timer.activeEntryId;
      return {
        ...state,
        entries: entryId
          ? state.entries.filter(e => e.id !== entryId)
          : state.entries,
        timer: {
          isRunning: false,
          activeEntryId: null,
          startedAt: null,
          accumulatedMs: 0,
        },
      };
    }

    case 'SET_GOAL_CONFIG':
      return { ...state, goalConfig: action.payload };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'HYDRATE':
      return { ...action.payload, selectedDate: todayStr() };

    default:
      return state;
  }
}
