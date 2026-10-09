# Plagdle Sophia – design spec

Date: 2026-10-08
Status: approved in chat, implementation follows.

## Purpose

A personal, non-commercial clone of https://www.plagdle.com/ for one user, an epidemiology student. Same rules as Plagdle. Different, richer attribute set. Starts with Plagdle's 60 diseases; the student's own list replaces them later.

## Non-goals

- Accounts, server, analytics.
- Guess limit or lose state.
- Archive of past puzzles.
- Copying Plagdle prose (hints, trivia). Disease names and factual attributes only.

## Stack

- Vite + React 18 + TypeScript.
- Vitest for unit tests.
- Plain CSS. Icons from lucide-react.
- Static build deployed to GitHub Pages by GitHub Actions on push to `main`.
- Vite `base` = `/plagdle-sophia/`.

## Data model

`src/data/diseases.ts` exports `DISEASES: Disease[]`.

```ts
type Vaccine = "Yes" | "Yes (limited)" | "No";
type Etiology = "Virus" | "Bacteria" | "Protozoa" | "Fungus" | "Parasite";
type Notifiable = "Yes" | "No";
type Pattern = "Endemic" | "Epidemic-prone" | "Pandemic" | "Eradicated" | "Sporadic";

interface Disease {
  name: string;            // unique
  vaccine: Vaccine;
  etiology: Etiology;
  incubationMin: number;   // days
  incubationMax: number;   // days, >= incubationMin
  treatment: string;       // "Family (Detail)" e.g. "Antibiotics (Doxycycline)"
  transmission: string;    // "Route (Detail)" e.g. "Insect (Mosquito)"
  reservoir: string;       // "Human" | "Animal (X)" | "Environmental (X)" | "Human, Animal (X)"
  r0: number;              // representative basic reproduction number
  cfr: number;             // % case fatality, untreated or as noted
  notifiable: Notifiable;  // US NNDSS
  pattern: Pattern;
  smallHint: string;       // shown after 3 guesses
  bigHint: string;         // shown after 6 guesses
  trivia: string;          // shown on win
  notes: string;           // source / caveat for r0, cfr; shown on win
}
```

Validation test enforces: all fields present, enums valid, unique names, `incubationMin <= incubationMax`, `r0 >= 0`, `0 <= cfr <= 100`, non-empty strings.

## Comparison rules

Each guess row renders one cell per attribute (10 attribute cells after the name). Result is `exact | partial | none`, with optional `direction: "up" | "down"` for numeric cells.

Categorical, case-insensitive:
- `exact` if equal.
- `partial` if either string contains the first word of the other. Applies to vaccine, treatment, transmission, reservoir.
- Etiology, notifiable, pattern: `exact` or `none` only.

Numeric:
- incubationMin, incubationMax: `exact` if equal, else `none` with direction (`up` if guess < answer, `down` if guess > answer).
- r0: `exact` if equal, `partial` if `|guess - answer| <= 1`, else `none`. Direction set whenever not equal.
- cfr: `exact` if equal, `partial` if `|guess - answer| <= 2`, else `none`. Direction set whenever not equal.

Share emoji: exact 🟩, partial 🟨, none 🟥.

Column order: Disease, Vaccine, Etiology, Min Incubation, Max Incubation, Treatment, Transmission, Reservoir, R0, CFR, Notifiable, Pattern.

## Modes

### Daily
- `today` = UTC date `YYYY-MM-DD`.
- `answer = DISEASES[(dayOfYear(today) - 1) % DISEASES.length]`, dayOfYear 1-based.
- A 1-second interval always runs. It updates the countdown and, when the UTC date changes, reloads daily state.
- Guesses, hints, win, streak, share.
- State persisted in `localStorage`:
  - `plagdleSophia.today` = `{ date, answerName, guesses: string[], gameWon, hint1, hint2 }`. Restored only if `date === today` and `answerName` matches today's answer.
  - `plagdleSophia.stats` = `{ played, currentStreak, lastWonDate }`.

### Practice
- Header toggle Daily | Practice.
- Random disease per round. "New disease" button always visible in practice.
- Same guessing, hints, table, win panel (without streak, share, countdown).
- Memory only. Reload returns to Daily.

## Guessing
- Text input. Suggestions: case-insensitive substring on name, exclude already guessed, max 5.
- Enter submits if the text matches a name case-insensitively. Clicking a suggestion submits that name.
- Duplicate guesses ignored. Unlimited guesses. Game ends only on correct guess.

## Hints
- Hint 1 button enabled after 3 guesses, shows `smallHint`.
- Hint 2 button enabled after 6 guesses, shows `bigHint`.
- Once shown, stays shown. Daily hint state persisted.

## Streak and stats
- On daily win: if `lastWonDate === today` no change. Else `played += 1`; `currentStreak = lastWonDate === yesterday ? currentStreak + 1 : 1`; `lastWonDate = today`.
- Displayed streak = `currentStreak` if `lastWonDate` is today or yesterday, else 0.

## Win panel (daily)
- "You found it in N guesses."
- Played and Streak.
- Share button: native share on coarse-pointer devices, else clipboard. Toast for 2 s.
- Share text:
  ```
  Plagdle Sophia YYYY-MM-DD 🦠
  Solved in N guesses (💡k hints)
  🔥 S-day streak            <- only if S > 1

  <one emoji row per guess, 10 cells>

  <site URL>
  ```
- Trivia, notes, countdown to next puzzle.

## UI
- Same structure as Plagdle: header, game card, How to Play card.
- Table scrolls horizontally on narrow screens; first column sticky.
- Own color palette (not Plagdle purple).

## Project structure

```
src/
  main.tsx, App.tsx, styles.css
  data/diseases.ts
  game/types.ts, compare.ts, daily.ts, streak.ts, storage.ts, share.ts
  components/Header.tsx, GuessInput.tsx, GuessTable.tsx, Hints.tsx, WinPanel.tsx, HowToPlay.tsx
tests/compare.test.ts, daily.test.ts, streak.test.ts, share.test.ts, data.test.ts
.github/workflows/deploy.yml
```

## Phases
1. Scaffold, logic modules, tests.
2. Data file with first-pass values for 60 diseases.
3. UI.
4. GitHub repo + Pages deploy.
5. Research pass: verify r0, cfr, reservoir, notifiable, pattern per disease against CDC/WHO/reviews; record source in `notes`.
6. Replace dataset with the student's list.
