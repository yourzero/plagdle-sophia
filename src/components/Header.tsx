import { Lightbulb, Microscope } from "lucide-react";

export type Mode = "daily" | "practice";

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  streak: number;
  guessCount: number;
  hint1: boolean;
  hint2: boolean;
  onHint1: () => void;
  onHint2: () => void;
}

export default function Header({ mode, onMode, streak, guessCount, hint1, hint2, onHint1, onHint2 }: Props) {
  return (
    <header className="header">
      <div className="title-row">
        <Microscope className="title-icon" aria-hidden />
        <h1 className="title">Plagdle Sophia</h1>
        <Microscope className="title-icon flipped" aria-hidden />
      </div>
      <p className="subtitle">Guess the infectious disease from its epidemiology.</p>

      <div className="mode-toggle" role="tablist" aria-label="Game mode">
        <button role="tab" aria-selected={mode === "daily"} className={mode === "daily" ? "active" : ""} onClick={() => onMode("daily")}>
          Daily
        </button>
        <button role="tab" aria-selected={mode === "practice"} className={mode === "practice" ? "active" : ""} onClick={() => onMode("practice")}>
          Practice
        </button>
      </div>

      <div className="stats-row">
        {mode === "daily" && (
          <div className="stat-box">
            <div className="stat-number">{streak}</div>
            <div className="stat-label">Streak</div>
          </div>
        )}
        <HintButton label="First Hint" unlockAt={3} guessCount={guessCount} used={hint1} onClick={onHint1} />
        <HintButton label="Second Hint" unlockAt={6} guessCount={guessCount} used={hint2} onClick={onHint2} />
      </div>
    </header>
  );
}

function HintButton({ label, unlockAt, guessCount, used, onClick }: { label: string; unlockAt: number; guessCount: number; used: boolean; onClick: () => void }) {
  const locked = guessCount < unlockAt;
  const cls = ["hint-button", locked ? "locked" : "", used ? "used" : ""].join(" ");
  return (
    <button className={cls} disabled={locked || used} onClick={onClick} title={locked ? `Unlocks after ${unlockAt} guesses` : undefined}>
      <Lightbulb className="hint-icon" aria-hidden />
      {label}
    </button>
  );
}
