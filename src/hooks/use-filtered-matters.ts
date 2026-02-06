import { useState, useEffect, useMemo } from 'react';
import { useAppState } from './use-app-state';

export function useFilteredMatters(searchQuery: string, includeInactive = false) {
  const { state } = useAppState();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return useMemo(() => {
    let filtered = state.matters.filter(m => {
      if (m.status === 'archived' && !includeInactive) return false;
      if (m.status === 'inactive' && !includeInactive) return false;
      return true;
    });

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.clientName.toLowerCase().includes(q) ||
        m.matterName.toLowerCase().includes(q) ||
        m.matterNumber.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => a.clientName.localeCompare(b.clientName) || a.matterName.localeCompare(b.matterName));
  }, [state.matters, debouncedQuery, includeInactive]);
}
