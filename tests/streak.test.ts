import { describe, it, expect } from "vitest";
import { recordWin, displayStreak, EMPTY_STATS } from "../src/game/streak";

describe("recordWin", () => {
  it("first win", () => {
    expect(recordWin(EMPTY_STATS, "2026-10-08")).toEqual({ played: 1, currentStreak: 1, lastWonDate: "2026-10-08" });
  });
  it("same day no-op", () => {
    const s = { played: 3, currentStreak: 2, lastWonDate: "2026-10-08" };
    expect(recordWin(s, "2026-10-08")).toBe(s);
  });
  it("consecutive day increments", () => {
    const s = { played: 3, currentStreak: 2, lastWonDate: "2026-10-07" };
    expect(recordWin(s, "2026-10-08")).toEqual({ played: 4, currentStreak: 3, lastWonDate: "2026-10-08" });
  });
  it("gap resets to 1", () => {
    const s = { played: 3, currentStreak: 2, lastWonDate: "2026-10-01" };
    expect(recordWin(s, "2026-10-08")).toEqual({ played: 4, currentStreak: 1, lastWonDate: "2026-10-08" });
  });
});

describe("displayStreak", () => {
  it("today or yesterday shows streak", () => {
    expect(displayStreak({ played: 1, currentStreak: 4, lastWonDate: "2026-10-08" }, "2026-10-08")).toBe(4);
    expect(displayStreak({ played: 1, currentStreak: 4, lastWonDate: "2026-10-07" }, "2026-10-08")).toBe(4);
  });
  it("stale shows 0", () => {
    expect(displayStreak({ played: 1, currentStreak: 4, lastWonDate: "2026-10-06" }, "2026-10-08")).toBe(0);
    expect(displayStreak(EMPTY_STATS, "2026-10-08")).toBe(0);
  });
});
