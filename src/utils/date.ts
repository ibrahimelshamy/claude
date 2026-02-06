export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function countWorkingDays(from: Date, to: Date): number {
  let count = 0;
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    if (isWeekday(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function getMonthWeeks(year: number, month: number): { start: string; end: string; weekNum: number }[] {
  const weeks: { start: string; end: string; weekNum: number }[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  let weekStart = new Date(monthStart);
  let weekNum = 1;

  while (weekStart <= monthEnd) {
    const weekEnd = new Date(weekStart);
    // Go to Sunday or end of month
    while (weekEnd.getDay() !== 0 && weekEnd < monthEnd) {
      weekEnd.setDate(weekEnd.getDate() + 1);
    }
    if (weekEnd > monthEnd) {
      weekEnd.setTime(monthEnd.getTime());
    }

    weeks.push({
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
      weekNum,
    });

    weekNum++;
    weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() + 1);
  }

  return weeks;
}

export function todayStr(): string {
  return formatDate(new Date());
}
