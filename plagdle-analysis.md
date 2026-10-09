# Plagdle – how it works

Source: https://www.plagdle.com/ (React SPA, single JS bundle, no backend). Analyzed 2026-10-08 from the built bundle and live play.

## Architecture

- Static React app (Create React App build). One JS file, one CSS file. No API calls.
- Entire disease dataset (60 records) is embedded in the bundle.
- All state lives in `localStorage`. No accounts, no server.
- Google Analytics `gtag` events: `game_start`, `guess`, `hint_used`, `game_complete`, `share`.

## Data model

One record per disease:

| Field | Type | Example |
|---|---|---|
| `name` | string | "Malaria" |
| `vaccine` | enum (3) | No / Yes / Yes (limited) |
| `etiology` | enum (5) | Virus / Bacteria / Protozoa / Fungus / Parasite |
| `incubationMin` | number (days) | 7 |
| `incubationMax` | number (days) | 30 |
| `treatment` | string (~45 distinct) | "Antiparasitic (Artemisinin-based therapy)" |
| `vector` | string (~25 distinct) | "Insect (Mosquito)" |
| `trivia` | string | shown after win ("Fun Fact!") |
| `smallHint` | string | unlocks after 3 guesses |
| `bigHint` | string | unlocks after 6 guesses |

Vector and treatment are free text with a recurring `Family (Detail)` shape, e.g. "Insect (Tick)". Partial matching keys on the first word.

## Daily puzzle selection

Deterministic, client-side, no server:

1. `today` = UTC date string `YYYY-MM-DD`.
2. `dayOfYear` = days since Jan 1 of that year, 1-based.
3. `answer = diseases[(dayOfYear - 1) % diseases.length]`.

Consequences: same puzzle for everyone; index wraps every 60 days and restarts at record 0 each Jan 1; the answer is trivially readable from the bundle. Resets at 00:00 UTC. After a win, a 1-second interval drives the "Next disease in HH:MM:SS" countdown and reloads state when the day flips. Mid-game there is no rollover check until page reload.

## Guess flow

1. Text input with autocomplete: case-insensitive substring on `name`, excludes already-guessed, max 5 suggestions.
2. Enter or click suggestion submits. Enter requires an exact, case-sensitive name match ("malaria" + Enter does nothing). Clicking a suggestion always works. Duplicate guesses are ignored.
3. Guess appended to list; row rendered in a comparison table.
4. If `guess.name === answer.name`: game won, input hidden, win panel shown.
5. No guess limit. No lose state. Game ends only on win.

## Comparison rules (per cell)

Three CSS classes: exact (green), partial (yellow), no-match (red).

**Categorical fields** (vaccine, etiology, treatment, vector), case-insensitive:
- exact: strings equal.
- partial: one string contains the first word of the other. "Yes (limited)" vs "Yes" = partial. "Insect (Tick)" vs "Insect (Mosquito)" = partial. "Airborne (Droplet)" vs "Airborne" = partial.
- else no-match.

**Numeric fields** (incubationMin, incubationMax):
- equal: green, no arrow.
- guess < answer: red + up arrow (go higher).
- guess > answer: red + down arrow (go lower).
- No yellow "close" band.

Table columns: Disease | Vaccine | Etiology | Min Incubation | Max Incubation | Treatment | Vector. Disease cell shows X icon or trophy icon.

## Hints

- Two buttons in header, disabled until unlocked.
- First Hint: enabled after 3 guesses, shows `smallHint`.
- Second Hint: enabled after 6 guesses, shows `bigHint`.
- Once clicked, stays open; persisted in today's state. Hint usage is reported in share text.

## Streak and stats

`localStorage["plagdleStats"]` = `{ played, currentStreak, lastWonDate }`.

- On win: if `lastWonDate === today` do nothing. If `lastWonDate === yesterday` then `streak + 1`, else `streak = 1`. `played + 1`. `played` increments only on win, so it is a win count, not games started.
- Displayed streak = `currentStreak` only if `lastWonDate` is today or yesterday, else 0. Streak is not reset in storage, just hidden; next win starts at 1.
- Legacy keys `diseaseGameStreak` and `diseaseGameLastPlayed` are migrated on first load.

## Today's state persistence

`localStorage["diseaseGameTodayState"]` = `{ date, diseaseName, guesses[], gameWon, showHint, showSecondHint }`.

On load, state is restored only if `date === today` and `diseaseName === today's answer`. Otherwise it is discarded (handles dataset reorders). Guesses are stored as full disease objects plus `correct: bool`.

## Win panel

- "Congratulations! You found the disease in N guesses."
- Played / Streak summary.
- Share button → emoji grid (🟩🟨🟥 per column per guess), e.g.

```
Plagdle 2026-10-08 🦠
Solved in 3 guesses (💡1 hint)
🔥 4-day streak

🟨🟥🟥🟥🟥🟥
🟩🟩🟥🟩🟥🟩
🟩🟩🟩🟩🟩🟩

https://plagdle.com
```

  Uses `navigator.share` on touch devices, otherwise clipboard. Toast "Copied to clipboard!" for 2 s.
- Trivia paragraph.
- Countdown to next puzzle.

## UI

- Purple gradient background, white cards with translucency.
- Header: title with icons, subtitle, three stat boxes (Streak, First Hint, Second Hint).
- Game card: input, hints (if open), guess table, legend, win panel.
- How to Play card, feedback Google Form link, cross-promo links to sibling games (Pharmageddon, Neurdle).
- Icons from lucide-react.

## Things to decide differently when building your own

- Server-side or hashed daily selection if answer should not be scrapable.
- Guess limit / lose state (Plagdle has none).
- Yellow "close" band for numeric fields.
- Archive / play past puzzles (Plagdle has none).
- Stats distribution (guess histogram) – Plagdle tracks only played + streak.
- Hard mode, dark mode, accounts – none present.
