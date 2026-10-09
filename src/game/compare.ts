import type { CellResult, Disease } from "./types";

type NumericKey = "incubationMin" | "incubationMax" | "r0" | "cfr";
type CategoricalKey = "vaccine" | "etiology" | "treatment" | "transmission" | "reservoir" | "notifiable" | "pattern";

export type ColumnDef =
  | { key: NumericKey; label: string; kind: "numeric"; closeBand: number; suffix?: string }
  | { key: CategoricalKey; label: string; kind: "categorical"; allowPartial: boolean };

export const COLUMNS: ColumnDef[] = [
  { key: "vaccine", label: "Vaccine", kind: "categorical", allowPartial: true },
  { key: "etiology", label: "Etiology", kind: "categorical", allowPartial: false },
  { key: "incubationMin", label: "Min Incubation", kind: "numeric", closeBand: 0, suffix: "d" },
  { key: "incubationMax", label: "Max Incubation", kind: "numeric", closeBand: 0, suffix: "d" },
  { key: "treatment", label: "Treatment", kind: "categorical", allowPartial: true },
  { key: "transmission", label: "Transmission", kind: "categorical", allowPartial: true },
  { key: "reservoir", label: "Reservoir", kind: "categorical", allowPartial: true },
  { key: "r0", label: "R0", kind: "numeric", closeBand: 1 },
  { key: "cfr", label: "CFR", kind: "numeric", closeBand: 2, suffix: "%" },
  { key: "notifiable", label: "Notifiable (US)", kind: "categorical", allowPartial: false },
  { key: "pattern", label: "Pattern", kind: "categorical", allowPartial: false },
];

function firstWord(s: string): string {
  return s.trim().split(/\s+/)[0].replace(/[^a-z0-9-]/gi, "").toLowerCase();
}

export function compareCategorical(guess: string, answer: string, allowPartial: boolean): CellResult {
  const g = guess.trim().toLowerCase();
  const a = answer.trim().toLowerCase();
  if (g === a) return { match: "exact" };
  if (!allowPartial) return { match: "none" };
  const gw = firstWord(guess);
  const aw = firstWord(answer);
  if (gw && aw && (g.includes(aw) || a.includes(gw))) return { match: "partial" };
  return { match: "none" };
}

export function compareNumeric(guess: number, answer: number, closeBand: number): CellResult {
  if (guess === answer) return { match: "exact" };
  const direction = guess < answer ? "up" : "down";
  const match = Math.abs(guess - answer) <= closeBand ? "partial" : "none";
  return { match, direction };
}

export function compareGuess(guess: Disease, answer: Disease): CellResult[] {
  return COLUMNS.map((col) =>
    col.kind === "numeric"
      ? compareNumeric(guess[col.key], answer[col.key], col.closeBand)
      : compareCategorical(guess[col.key], answer[col.key], col.allowPartial),
  );
}

export function findDisease(name: string, list: Disease[]): Disease | undefined {
  const n = name.trim().toLowerCase();
  return list.find((d) => d.name.toLowerCase() === n);
}

export function suggest(query: string, list: Disease[], exclude: string[], max = 5): Disease[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const ex = new Set(exclude.map((e) => e.toLowerCase()));
  return list
    .filter((d) => d.name.toLowerCase().includes(q) && !ex.has(d.name.toLowerCase()))
    .slice(0, max);
}
