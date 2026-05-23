export type DateRangePreset =
  | "today"
  | "7d"
  | "30d"
  | "quarter"
  | "year"
  | "all";

export function getDateRange(preset: DateRangePreset) {
  // Get current time in Asia/Kolkata timezone
  const kolkataNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const endLocal = new Date(kolkataNow);
  endLocal.setHours(23, 59, 59, 999);

  const startLocal = new Date(kolkataNow);
  startLocal.setHours(0, 0, 0, 0);

  // Helper to convert a local India representation date back to a UTC timestamp matching Indian time
  const toUtcDate = (localDate: Date) => {
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const seconds = localDate.getSeconds();
    const ms = localDate.getMilliseconds();
    
    // India is UTC + 5.5 hours. So to get UTC, we subtract 5.5 hours.
    const utcTime = Date.UTC(year, month, day, hours, minutes, seconds, ms) - (5.5 * 60 * 60 * 1000);
    return new Date(utcTime);
  };

  switch (preset) {
    case "today":
      return { start: toUtcDate(startLocal), end: toUtcDate(endLocal) };
    case "7d":
      startLocal.setDate(startLocal.getDate() - 7);
      return { start: toUtcDate(startLocal), end: toUtcDate(endLocal) };
    case "30d":
      startLocal.setDate(startLocal.getDate() - 30);
      return { start: toUtcDate(startLocal), end: toUtcDate(endLocal) };
    case "quarter":
      startLocal.setDate(startLocal.getDate() - 90);
      return { start: toUtcDate(startLocal), end: toUtcDate(endLocal) };
    case "year":
      startLocal.setFullYear(startLocal.getFullYear() - 1);
      return { start: toUtcDate(startLocal), end: toUtcDate(endLocal) };
    case "all":
    default:
      return {
        start: new Date(0),
        end: toUtcDate(endLocal),
      };
  }
}

