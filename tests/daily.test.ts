import { describe, it, expect } from "vitest";
import {
  utcDateString,
  dayOfYear,
  dailyIndex,
  addDays,
  msUntilNextUtcMidnight,
  formatCountdown,
} from "../src/game/daily";

describe("daily", () => {
  it("utcDateString", () => {
    expect(utcDateString(new Date(Date.UTC(2026, 9, 8, 23, 59)))).toBe("2026-10-08");
  });
  it("dayOfYear 1-based", () => {
    expect(dayOfYear("2026-01-01")).toBe(1);
    expect(dayOfYear("2026-12-31")).toBe(365);
    expect(dayOfYear("2024-12-31")).toBe(366);
  });
  it("dailyIndex wraps and never negative", () => {
    expect(dailyIndex("2026-01-01", 60)).toBe(0);
    expect(dailyIndex("2026-03-02", 60)).toBe(0); // day 61
    expect(dailyIndex("2026-12-31", 60)).toBe(364 % 60);
  });
  it("addDays across month and year", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
  it("msUntilNextUtcMidnight", () => {
    expect(msUntilNextUtcMidnight(new Date(Date.UTC(2026, 0, 1, 23, 0, 0)))).toBe(3600_000);
  });
  it("formatCountdown", () => {
    expect(formatCountdown(3661_000)).toBe("01:01:01");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});
