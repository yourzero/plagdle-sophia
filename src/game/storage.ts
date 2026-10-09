import { EMPTY_STATS, type Stats } from "./streak";

export const KEYS = {
  today: "plagdleSophia.today",
  stats: "plagdleSophia.stats",
} as const;

export interface TodayState {
  date: string;
  answerName: string;
  guesses: string[];
  gameWon: boolean;
  hint1: boolean;
  hint2: boolean;
}

function read(key: string): unknown {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadStats(): Stats {
  const v = read(KEYS.stats) as Partial<Stats> | null;
  if (!v || typeof v !== "object") return EMPTY_STATS;
  return { ...EMPTY_STATS, ...v };
}

export function saveStats(stats: Stats): void {
  write(KEYS.stats, stats);
}

export function loadToday(today: string, answerName: string): TodayState | null {
  const v = read(KEYS.today) as Partial<TodayState> | null;
  if (!v || typeof v !== "object") return null;
  if (v.date !== today || v.answerName !== answerName || !Array.isArray(v.guesses)) return null;
  return {
    date: v.date,
    answerName: v.answerName,
    guesses: v.guesses,
    gameWon: Boolean(v.gameWon),
    hint1: Boolean(v.hint1),
    hint2: Boolean(v.hint2),
  };
}

export function saveToday(state: TodayState): void {
  write(KEYS.today, state);
}
