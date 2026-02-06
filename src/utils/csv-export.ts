import type { TimeEntry, ClientMatter } from '../types';

export function exportToCsv(entries: TimeEntry[], matters: ClientMatter[], filename?: string): void {
  const matterMap = new Map(matters.map(m => [m.id, m]));
  const headers = ['Date', 'Matter Number', 'Client', 'Matter', 'Description', 'Start Time', 'End Time', 'Hours', 'Billable'];
  const rows = entries.map(e => {
    const m = matterMap.get(e.matterId);
    return [
      e.date,
      m?.matterNumber ?? '',
      escapeCsvField(m?.clientName ?? ''),
      escapeCsvField(m?.matterName ?? ''),
      escapeCsvField(e.description),
      e.startTime ? new Date(e.startTime).toLocaleTimeString() : '',
      e.endTime ? new Date(e.endTime).toLocaleTimeString() : '',
      (e.durationMinutes / 60).toFixed(2),
      e.billable ? 'Yes' : 'No',
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `timesheet-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
