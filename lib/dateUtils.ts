export function getStudentDateStr(date: Date = new Date()): string {
  // A "Student Day" doesn't roll over to the next day until 4:00 AM.
  // We offset the current time backwards by 4 hours.
  // E.g., If it's Tuesday 2:30 AM, offsetting by 4 hours makes it Monday 10:30 PM.
  // Thus it belongs to the "Monday" logical day.
  const offsetDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  
  // Format as YYYY-MM-DD
  return offsetDate.toISOString().split('T')[0];
}

export function getStudentDayIndex(date: Date = new Date()): number {
  const offsetDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  return offsetDate.getDay();
}
