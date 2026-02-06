import { useState, useEffect, useCallback } from 'react';
import { useAppState } from './use-app-state';
import type { TimeEntry } from '../types';

export function useTimer() {
  const { state, dispatch } = useAppState();
  const { timer } = state;
  const [displayMs, setDisplayMs] = useState(0);

  useEffect(() => {
    if (!timer.isRunning || !timer.startedAt) {
      setDisplayMs(timer.accumulatedMs);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - new Date(timer.startedAt!).getTime();
      setDisplayMs(timer.accumulatedMs + elapsed);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startedAt, timer.accumulatedMs]);

  const startTimer = useCallback((matterId: string, description: string, date?: string) => {
    // Stop existing timer first if running
    if (timer.isRunning && timer.activeEntryId) {
      const now = new Date();
      const elapsed = timer.startedAt
        ? now.getTime() - new Date(timer.startedAt).getTime() + timer.accumulatedMs
        : timer.accumulatedMs;
      dispatch({
        type: 'STOP_TIMER',
        payload: {
          entryId: timer.activeEntryId,
          durationMinutes: Math.round(elapsed / 60000),
          endTime: now.toISOString(),
        },
      });
    }

    const now = new Date().toISOString();
    const entryId = crypto.randomUUID();
    const newEntry: TimeEntry = {
      id: entryId,
      matterId,
      date: date || now.split('T')[0],
      description,
      startTime: now,
      endTime: null,
      durationMinutes: 0,
      entryType: 'timer',
      billable: true,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    dispatch({ type: 'START_TIMER', payload: { entryId, startedAt: now } });
  }, [dispatch, timer]);

  const stopTimer = useCallback(() => {
    if (!timer.activeEntryId) return;
    const now = new Date();
    const durationMinutes = Math.max(1, Math.round(displayMs / 60000));
    dispatch({
      type: 'STOP_TIMER',
      payload: {
        entryId: timer.activeEntryId,
        durationMinutes,
        endTime: now.toISOString(),
      },
    });
  }, [timer.activeEntryId, displayMs, dispatch]);

  const discardTimer = useCallback(() => {
    dispatch({ type: 'DISCARD_TIMER' });
  }, [dispatch]);

  const activeEntry = timer.activeEntryId
    ? state.entries.find(e => e.id === timer.activeEntryId)
    : null;

  const activeMatter = activeEntry
    ? state.matters.find(m => m.id === activeEntry.matterId)
    : null;

  return {
    displayMs,
    isRunning: timer.isRunning,
    activeEntry,
    activeMatter,
    startTimer,
    stopTimer,
    discardTimer,
  };
}
