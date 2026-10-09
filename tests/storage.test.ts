import { describe, it, expect, beforeEach } from "vitest";
import { loadStats, saveStats, loadToday, saveToday, KEYS } from "../src/game/storage";
import { EMPTY_STATS } from "../src/game/streak";

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  } as Storage;
}

describe("storage", () => {
  beforeEach(() => {
    (globalThis as any).localStorage = memStorage();
  });

  it("stats round trip, default when empty", () => {
    expect(loadStats()).toEqual(EMPTY_STATS);
    saveStats({ played: 2, currentStreak: 2, lastWonDate: "2026-10-08" });
    expect(loadStats()).toEqual({ played: 2, currentStreak: 2, lastWonDate: "2026-10-08" });
    expect(localStorage.getItem(KEYS.stats)).not.toBeNull();
  });

  it("today round trip", () => {
    const s = { date: "2026-10-08", answerName: "Malaria", guesses: ["Dengue"], gameWon: false, hint1: true, hint2: false };
    saveToday(s);
    expect(loadToday("2026-10-08", "Malaria")).toEqual(s);
  });

  it("null on date or answer mismatch", () => {
    saveToday({ date: "2026-10-07", answerName: "Malaria", guesses: [], gameWon: false, hint1: false, hint2: false });
    expect(loadToday("2026-10-08", "Malaria")).toBeNull();
    saveToday({ date: "2026-10-08", answerName: "Dengue", guesses: [], gameWon: false, hint1: false, hint2: false });
    expect(loadToday("2026-10-08", "Malaria")).toBeNull();
  });

  it("null on corrupt json", () => {
    localStorage.setItem(KEYS.today, "{nope");
    expect(loadToday("2026-10-08", "Malaria")).toBeNull();
  });

  it("survives throwing storage", () => {
    (globalThis as any).localStorage = {
      getItem() { throw new Error("denied"); },
      setItem() { throw new Error("denied"); },
    };
    expect(loadStats()).toEqual(EMPTY_STATS);
    expect(loadToday("2026-10-08", "Malaria")).toBeNull();
    expect(() => saveStats(EMPTY_STATS)).not.toThrow();
  });
});
