export function formatRelativeDay(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diff === 0) return "היום";
  if (diff === 1) return "אתמול";
  if (diff === 2) return "שלשום";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

export function formatDayPill(ms: number): { dow: string; day: string } {
  const d = new Date(ms);
  const dow = d.toLocaleDateString("he-IL", { weekday: "short" }).replace("יום ", "");
  const day = String(d.getDate());
  return { dow, day };
}

export function dayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function daysAgo(n: number): number {
  return dayStart(Date.now() - n * 86400000);
}
