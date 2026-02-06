import { useState, useMemo } from 'react';
import { useAppState } from '../../hooks/use-app-state';
import { formatHoursDecimal, formatTimeOfDay } from '../../utils/time';
import { formatDate, startOfMonth, endOfMonth } from '../../utils/date';
import { exportToCsv } from '../../utils/csv-export';

export function ExportView() {
  const { state } = useAppState();
  const now = new Date();

  const [dateFrom, setDateFrom] = useState(formatDate(startOfMonth(now)));
  const [dateTo, setDateTo] = useState(formatDate(endOfMonth(now)));
  const [matterFilter, setMatterFilter] = useState('all');
  const [billableFilter, setBillableFilter] = useState<'all' | 'billable' | 'nonbillable'>('all');

  const filteredEntries = useMemo(() => {
    return state.entries
      .filter(e => {
        if (e.date < dateFrom || e.date > dateTo) return false;
        if (matterFilter !== 'all' && e.matterId !== matterFilter) return false;
        if (billableFilter === 'billable' && !e.billable) return false;
        if (billableFilter === 'nonbillable' && e.billable) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''));
  }, [state.entries, dateFrom, dateTo, matterFilter, billableFilter]);

  const totalMinutes = filteredEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const billableMinutes = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0);

  const matterMap = useMemo(() => new Map(state.matters.map(m => [m.id, m])), [state.matters]);

  const activeMatters = useMemo(() => {
    const matterIds = new Set(state.entries.map(e => e.matterId));
    return state.matters.filter(m => matterIds.has(m.id)).sort((a, b) => a.clientName.localeCompare(b.clientName));
  }, [state.matters, state.entries]);

  const handleExport = () => {
    exportToCsv(filteredEntries, state.matters);
  };

  return (
    <div className="export-view">
      <div className="export-filters">
        <div className="export-filter-row">
          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Matter</label>
            <select
              className="input"
              value={matterFilter}
              onChange={e => setMatterFilter(e.target.value)}
            >
              <option value="all">All Matters</option>
              {activeMatters.map(m => (
                <option key={m.id} value={m.id}>
                  {m.matterNumber} - {m.clientName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Billing</label>
            <select
              className="input"
              value={billableFilter}
              onChange={e => setBillableFilter(e.target.value as typeof billableFilter)}
            >
              <option value="all">All</option>
              <option value="billable">Billable Only</option>
              <option value="nonbillable">Non-Billable Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="export-summary">
        <span>{filteredEntries.length} entries</span>
        <span>{formatHoursDecimal(totalMinutes)} total hours</span>
        <span>{formatHoursDecimal(billableMinutes)} billable hours</span>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={filteredEntries.length === 0}
        >
          Download CSV
        </button>
      </div>

      <div className="export-preview">
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <h3>No entries match your filters</h3>
            <p>Adjust the date range or filters to see entries.</p>
          </div>
        ) : (
          <table className="export-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matter #</th>
                <th>Client</th>
                <th>Description</th>
                <th>Start</th>
                <th>End</th>
                <th>Hours</th>
                <th>Billable</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.slice(0, 100).map(e => {
                const m = matterMap.get(e.matterId);
                return (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>{m?.matterNumber || '—'}</td>
                    <td>{m?.clientName || '—'}</td>
                    <td className="export-desc-cell">{e.description || '—'}</td>
                    <td>{formatTimeOfDay(e.startTime)}</td>
                    <td>{formatTimeOfDay(e.endTime)}</td>
                    <td>{formatHoursDecimal(e.durationMinutes)}</td>
                    <td>{e.billable ? 'Yes' : 'No'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filteredEntries.length > 100 && (
          <p className="export-truncated">
            Showing first 100 of {filteredEntries.length} entries. Download CSV for all data.
          </p>
        )}
      </div>
    </div>
  );
}
