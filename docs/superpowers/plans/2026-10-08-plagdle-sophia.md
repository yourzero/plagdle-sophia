# Plagdle Sophia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Plagdle-style daily disease guessing game with epi attributes and a practice mode, deployed to GitHub Pages.

**Architecture:** Pure TypeScript game modules (`src/game/*`) with no React, unit tested by Vitest. React components render state from `App.tsx`. Dataset is a typed TS array validated by a test.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Vitest, lucide-react, GitHub Actions → Pages.

**Spec:** `docs/superpowers/specs/2026-10-08-plagdle-sophia-design.md`

## Global Constraints

- Vite `base: "/plagdle-sophia/"`.
- localStorage keys: `plagdleSophia.today`, `plagdleSophia.stats`.
- Column order: Disease, Vaccine, Etiology, Min Incubation, Max Incubation, Treatment, Transmission, Reservoir, R0, CFR, Notifiable, Pattern.
- Numeric close bands: r0 ±1, cfr ±2.
- No Plagdle prose copied. Names and factual attributes only.

## Review Focus

1. Dec 31 → Jan 1 rollover: dayOfYear resets; daily index must not go negative. Test in `daily.test.ts`.
2. localStorage throws (private mode): storage wrappers swallow and return null. Test in `storage.test.ts`.
3. Stored today-state for a different answer name (dataset reordered): discard. Test in `storage.test.ts`.
4. Enter with mixed-case name ("MALARIA"): submits. Test in `App` behavior via `findDisease` in `compare.test.ts`.
5. Practice mode after daily win: practice must not touch stats. Covered by `streak.test.ts` purity + manual check.

---

### Task 1: Scaffold

**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder), `.github/workflows/deploy.yml`

- [ ] `npm create vite@latest . -- --template react-ts` equivalent by hand (no interactive).
- [ ] Add vitest, lucide-react. `vite.config.ts` with `base`, `test.environment: "jsdom"` only where needed (logic tests use node).
- [ ] `npm test` runs with zero tests passing (no failure).
- [ ] Commit.

### Task 2: Types and compare

**Files:** `src/game/types.ts`, `src/game/compare.ts`, `tests/compare.test.ts`

**Produces:**
```ts
type Match = "exact" | "partial" | "none";
interface CellResult { match: Match; direction?: "up" | "down" }
compareCategorical(guess: string, answer: string, allowPartial: boolean): CellResult
compareNumeric(guess: number, answer: number, closeBand: number): CellResult
compareGuess(guess: Disease, answer: Disease): CellResult[]   // 11 cells in column order
findDisease(name: string, list: Disease[]): Disease | undefined // case-insensitive
suggest(query: string, list: Disease[], exclude: string[], max = 5): Disease[]
```

- [ ] Tests: exact, partial first-word both directions, none; numeric equal / up / down / close band; compareGuess length 10 and order; findDisease case-insensitive; suggest excludes guessed, caps at 5.
- [ ] Implement. Pass. Commit.

### Task 3: daily

**Files:** `src/game/daily.ts`, `tests/daily.test.ts`

**Produces:**
```ts
utcDateString(d?: Date): string           // YYYY-MM-DD
dayOfYear(date: string): number           // 1-based
dailyIndex(date: string, n: number): number
addDays(date: string, delta: number): string
msUntilNextUtcMidnight(d?: Date): number
formatCountdown(ms: number): string       // HH:MM:SS
```

- [ ] Tests: Jan 1 → index 0; Dec 31 non-leap → 364 % n; addDays across month/year; countdown format.
- [ ] Implement. Pass. Commit.

### Task 4: streak and storage

**Files:** `src/game/streak.ts`, `src/game/storage.ts`, `tests/streak.test.ts`, `tests/storage.test.ts`

**Produces:**
```ts
interface Stats { played: number; currentStreak: number; lastWonDate: string | null }
recordWin(stats: Stats, today: string): Stats     // pure
displayStreak(stats: Stats, today: string): number
interface TodayState { date: string; answerName: string; guesses: string[]; gameWon: boolean; hint1: boolean; hint2: boolean }
loadStats(): Stats; saveStats(s: Stats): void
loadToday(today: string, answerName: string): TodayState | null
saveToday(s: TodayState): void
```

- [ ] Tests: recordWin same day no-op; consecutive +1; gap resets to 1; displayStreak 0 when stale. Storage: round trip with in-memory localStorage stub; returns null on mismatch date/answer; survives `getItem` throwing.
- [ ] Implement. Pass. Commit.

### Task 5: share

**Files:** `src/game/share.ts`, `tests/share.test.ts`

**Produces:** `buildShareText(opts: { date: string; guesses: Disease[]; answer: Disease; hintsUsed: number; streak: number; url: string }): string`

- [ ] Test exact output for a 2-guess game, hints 1, streak 3. Emoji map 🟩🟨🟥.
- [ ] Implement. Pass. Commit.

### Task 6: dataset

**Files:** `src/data/diseases.ts`, `tests/data.test.ts`

- [ ] Write validation test per spec.
- [ ] Author 60 records. First-pass values; `notes` names basis.
- [ ] Pass. Commit.

### Task 7: UI

**Files:** `src/App.tsx`, `src/components/*.tsx`, `src/styles.css`

- [ ] `App.tsx`: mode state (`daily` | `practice`), daily state from storage, practice state in memory, 1 s tick always on, rollover reload.
- [ ] Components per spec. Sticky first column, horizontal scroll.
- [ ] `npm run build` succeeds. Manual check in browser: guess flow, hints, win, share, practice, reload persistence.
- [ ] Commit.

### Task 8: deploy

**Files:** `.github/workflows/deploy.yml`, `README.md`

- [ ] Workflow: checkout, setup-node 20, `npm ci`, `npm test`, `npm run build`, upload-pages-artifact, deploy-pages.
- [ ] Create GitHub repo, push, enable Pages (source: GitHub Actions). Verify URL loads.
- [ ] Commit.

### Task 9: research pass (later)

- [ ] Per disease: verify r0, cfr, reservoir, notifiable, pattern. Update `notes` with source. Separate commit per batch.
