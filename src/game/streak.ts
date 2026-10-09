import { addDays } from "./daily";

export interface Stats {
  played: number;
  currentStreak: number;
  lastWonDate: string | null;
}

export const EMPTY_STATS: Stats = { played: 0, currentStreak: 0, lastWonDate: null };

export function recordWin(stats: Stats, today: string): Stats {
  if (stats.lastWonDate === today) return stats;
  const consecutive = stats.lastWonDate === addDays(today, -1);
  return {
    played: stats.played + 1,
    currentStreak: consecutive ? stats.currentStreak + 1 : 1,
    lastWonDate: today,
  };
}

export function displayStreak(stats: Stats, today: string): number {
  if (stats.lastWonDate === today || stats.lastWonDate === addDays(today, -1)) return stats.currentStreak;
  return 0;
}
