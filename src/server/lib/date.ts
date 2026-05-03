export type DateRangePreset = "today" | "7d" | "30d" | "all";

export function getDateRange(preset: DateRangePreset) {
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { start, end };
    case "7d":
      start.setDate(start.getDate() - 7);
      return { start, end };
    case "30d":
      start.setDate(start.getDate() - 30);
      return { start, end };
    case "all":
    default:
      return {
        start: new Date(0),
        end,
      };
  }
}
