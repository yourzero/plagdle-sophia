const DAY_MS = 86_400_000;

export function utcDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function parse(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

export function dayOfYear(date: string): number {
  const [y, m, d] = parse(date);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / DAY_MS) + 1;
}

export function dailyIndex(date: string, n: number): number {
  return (dayOfYear(date) - 1) % n;
}

export function addDays(date: string, delta: number): string {
  const [y, m, d] = parse(date);
  return new Date(Date.UTC(y, m - 1, d) + delta * DAY_MS).toISOString().slice(0, 10);
}

export function msUntilNextUtcMidnight(d: Date = new Date()): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - d.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(total / 3600))}:${p(Math.floor((total % 3600) / 60))}:${p(total % 60)}`;
}
