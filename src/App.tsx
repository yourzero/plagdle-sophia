import { useCallback, useEffect, useMemo, useState } from "react";
import { DISEASES } from "./data/diseases";
import type { Disease } from "./game/types";
import { findDisease } from "./game/compare";
import { dailyIndex, utcDateString } from "./game/daily";
import { displayStreak, recordWin, type Stats } from "./game/streak";
import { loadStats, loadToday, saveStats, saveToday, type TodayState } from "./game/storage";
import Header, { type Mode } from "./components/Header";
import GuessInput from "./components/GuessInput";
import GuessTable from "./components/GuessTable";
import Hints from "./components/Hints";
import WinPanel from "./components/WinPanel";
import HowToPlay from "./components/HowToPlay";

interface Round {
  answer: Disease;
  guesses: string[];
  gameWon: boolean;
  hint1: boolean;
  hint2: boolean;
}

function dailyAnswer(date: string): Disease {
  return DISEASES[dailyIndex(date, DISEASES.length)];
}

function loadDaily(date: string): Round {
  const answer = dailyAnswer(date);
  const saved = loadToday(date, answer.name);
  return {
    answer,
    guesses: saved?.guesses ?? [],
    gameWon: saved?.gameWon ?? false,
    hint1: saved?.hint1 ?? false,
    hint2: saved?.hint2 ?? false,
  };
}

function randomRound(exclude?: string): Round {
  let d = DISEASES[Math.floor(Math.random() * DISEASES.length)];
  if (DISEASES.length > 1 && d.name === exclude) d = DISEASES[(DISEASES.indexOf(d) + 1) % DISEASES.length];
  return { answer: d, guesses: [], gameWon: false, hint1: false, hint2: false };
}

export default function App() {
  const [mode, setMode] = useState<Mode>("daily");
  const [date, setDate] = useState(utcDateString);
  const [daily, setDaily] = useState<Round>(() => loadDaily(utcDateString()));
  const [practice, setPractice] = useState<Round>(() => randomRound());
  const [stats, setStats] = useState<Stats>(loadStats);
  const [tick, setTick] = useState(Date.now);

  // Always-on clock: drives the countdown and rolls the daily puzzle at UTC midnight.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTick(now);
      const today = utcDateString(new Date(now));
      if (today !== date) {
        setDate(today);
        setDaily(loadDaily(today));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [date]);

  const round = mode === "daily" ? daily : practice;
  const setRound = mode === "daily" ? setDaily : setPractice;

  const persistDaily = useCallback(
    (r: Round) => {
      const s: TodayState = { date, answerName: r.answer.name, guesses: r.guesses, gameWon: r.gameWon, hint1: r.hint1, hint2: r.hint2 };
      saveToday(s);
    },
    [date],
  );

  function update(patch: Partial<Round>) {
    const next = { ...round, ...patch };
    setRound(next);
    if (mode === "daily") persistDaily(next);
  }

  function onGuess(name: string) {
    if (round.gameWon || round.guesses.includes(name)) return;
    const won = name === round.answer.name;
    update({ guesses: [...round.guesses, name], gameWon: won });
    if (won && mode === "daily") {
      const next = recordWin(stats, date);
      setStats(next);
      saveStats(next);
    }
  }

  const guessedDiseases = useMemo(
    () => round.guesses.map((n) => findDisease(n, DISEASES)).filter((d): d is Disease => Boolean(d)),
    [round.guesses],
  );
  const hintsUsed = Number(round.hint1) + Number(round.hint2);
  const streak = displayStreak(stats, date);

  return (
    <div className="page">
      <Header
        mode={mode}
        onMode={setMode}
        streak={streak}
        guessCount={round.guesses.length}
        hint1={round.hint1}
        hint2={round.hint2}
        onHint1={() => update({ hint1: true })}
        onHint2={() => update({ hint2: true })}
      />

      <main className="card game">
        {mode === "practice" && (
          <div className="practice-bar">
            <span>Practice round. Does not count toward your streak.</span>
            <button className="link-button" onClick={() => setPractice(randomRound(practice.answer.name))}>
              New disease
            </button>
          </div>
        )}

        {!round.gameWon && <GuessInput diseases={DISEASES} guessed={round.guesses} onGuess={onGuess} />}

        <Hints answer={round.answer} hint1={round.hint1} hint2={round.hint2} />

        <GuessTable guesses={guessedDiseases} answer={round.answer} />

        <div className="legend">
          <span><i className="swatch exact" /> Exact</span>
          <span><i className="swatch partial" /> Partial / close</span>
          <span><i className="swatch none" /> No match</span>
        </div>

        {round.gameWon &&
          (mode === "daily" ? (
            <WinPanel
              mode="daily"
              answer={round.answer}
              guesses={guessedDiseases}
              hintsUsed={hintsUsed}
              played={stats.played}
              streak={streak}
              date={date}
              tick={tick}
            />
          ) : (
            <WinPanel mode="practice" answer={round.answer} guesses={guessedDiseases} onNew={() => setPractice(randomRound(practice.answer.name))} />
          ))}
      </main>

      <HowToPlay />
    </div>
  );
}
