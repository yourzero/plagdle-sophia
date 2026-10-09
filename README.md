# Plagdle Sophia

A personal, non-commercial clone of [Plagdle](https://www.plagdle.com/) with epidemiology attributes (R0, case fatality rate, reservoir, notifiable status, epidemic pattern) and a practice mode.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/plagdle-sophia/

## Test and build

```bash
npm test
npm run build
```

## Deploy

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml` runs tests, builds, and publishes `dist/` to GitHub Pages. In the repo settings, set Pages source to "GitHub Actions" once.

## Edit the disease list

All data lives in [src/data/diseases.ts](src/data/diseases.ts). Each record follows the `Disease` type in [src/game/types.ts](src/game/types.ts). `npm test` validates every record (enums, numeric ranges, `Family (Detail)` shape for treatment, transmission and reservoir).

The daily puzzle is `DISEASES[(dayOfYearUTC - 1) % DISEASES.length]`, so reordering the list changes which disease appears on which day.

## Data status

Values are a first pass from general knowledge and are not yet verified. Each record's `notes` field says what the numbers refer to. A research pass against CDC and WHO sources is planned.

## Docs

- Design spec: [docs/superpowers/specs/2026-10-08-plagdle-sophia-design.md](docs/superpowers/specs/2026-10-08-plagdle-sophia-design.md)
- Analysis of the original game: [plagdle-analysis.md](plagdle-analysis.md)
