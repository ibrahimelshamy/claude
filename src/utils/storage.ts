import type { AppState } from '../context/app-reducer';

const STORAGE_KEY = 'timekeeper_v1';
const STORAGE_VERSION = 1;

interface PersistedData {
  version: number;
  state: AppState;
  savedAt: string;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveState(state: AppState): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const data: PersistedData = {
      version: STORAGE_VERSION,
      state,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, 500);
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: PersistedData = JSON.parse(raw);
    if (data.version !== STORAGE_VERSION) {
      return null;
    }
    return data.state;
  } catch {
    return null;
  }
}
