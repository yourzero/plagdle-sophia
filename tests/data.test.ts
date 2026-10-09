import { describe, it, expect } from "vitest";
import { DISEASES } from "../src/data/diseases";
import { ETIOLOGIES, NOTIFIABLES, PATTERNS, VACCINES } from "../src/game/types";

const STRING_FIELDS = ["name", "treatment", "transmission", "reservoir", "smallHint", "bigHint", "trivia", "notes"] as const;
const FAMILY = /^[A-Z][A-Za-z-]+( \([^()]+\))?$/;

describe("dataset", () => {
  it("has at least 50 records", () => {
    expect(DISEASES.length).toBeGreaterThanOrEqual(50);
  });
  it("unique names", () => {
    const names = DISEASES.map((d) => d.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
  it.each(DISEASES.map((d) => [d.name, d] as const))("%s is valid", (_name, d) => {
    for (const f of STRING_FIELDS) expect(d[f].trim().length, f).toBeGreaterThan(0);
    expect(VACCINES).toContain(d.vaccine);
    expect(ETIOLOGIES).toContain(d.etiology);
    expect(NOTIFIABLES).toContain(d.notifiable);
    expect(PATTERNS).toContain(d.pattern);
    expect(d.incubationMin).toBeGreaterThanOrEqual(0);
    expect(d.incubationMax).toBeGreaterThanOrEqual(d.incubationMin);
    expect(d.r0).toBeGreaterThanOrEqual(0);
    expect(d.cfr).toBeGreaterThanOrEqual(0);
    expect(d.cfr).toBeLessThanOrEqual(100);
    expect(d.treatment, "treatment shape").toMatch(FAMILY);
    expect(d.transmission, "transmission shape").toMatch(FAMILY);
    expect(d.reservoir, "reservoir shape").toMatch(FAMILY);
  });
});
