export interface TimeEntry {
  id: string;
  matterId: string;
  date: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  entryType: 'timer' | 'manual';
  billable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimerState {
  isRunning: boolean;
  activeEntryId: string | null;
  startedAt: string | null;
  accumulatedMs: number;
}
