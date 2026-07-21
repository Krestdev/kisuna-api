/**
 * Working days: Mon–Sat (Sunday = off)
 * Saturday counts as 0.5 day
 */
export function calculateWorkingDays(start: Date, end: Date): number {
  let days = 0;
  const current = new Date(start);
  while (current <= end) {
    const dow = current.getDay(); // 0=Sun, 6=Sat
    if (dow !== 0) days += dow === 6 ? 0.5 : 1;
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Returns each working day between start and end (inclusive).
 * Saturday included as a working day.
 */
export function getWorkingDays(
  start: Date,
  end: Date,
): { date: Date; isHalfDay: boolean }[] {
  const days: { date: Date; isHalfDay: boolean }[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dow = current.getDay();
    if (dow !== 0) {
      days.push({ date: new Date(current), isHalfDay: dow === 6 });
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}
