/** A Firestore Timestamp, Date, epoch number or date string as a Date; null when it isn't one. */
export function toJsDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  const parsed = new Date(typeof value === "number" ? value : String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ordinalSuffix(dayOfMonth: number): string {
  if (dayOfMonth >= 11 && dayOfMonth <= 13) return "th";
  switch (dayOfMonth % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/** "12th November 2026" */
export function formatLongDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  return `${day}${ordinalSuffix(day)} ${month} ${date.getFullYear()}`;
}

/** Clock style: "4:05", or "1:04:05" from an hour up. */
export function formatTimerDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}

/** Stats style: "45s", "12m 5s", "1h 4m". */
export function formatWorkoutStatsDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return seconds > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}
