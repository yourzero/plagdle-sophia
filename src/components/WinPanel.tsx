import { useEffect, useState } from "react";
import { Clock, Lightbulb, RefreshCw, Share2, Trophy } from "lucide-react";
import type { Disease } from "../game/types";
import { buildShareText } from "../game/share";
import { formatCountdown, msUntilNextUtcMidnight } from "../game/daily";

interface DailyProps {
  mode: "daily";
  answer: Disease;
  guesses: Disease[];
  hintsUsed: number;
  played: number;
  streak: number;
  date: string;
  tick: number;
}
interface PracticeProps {
  mode: "practice";
  answer: Disease;
  guesses: Disease[];
  onNew: () => void;
}
type Props = DailyProps | PracticeProps;

export default function WinPanel(props: Props) {
  const { answer, guesses } = props;
  const n = guesses.length;
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  async function share() {
    if (props.mode !== "daily") return;
    const text = buildShareText({
      date: props.date,
      guesses,
      answer,
      hintsUsed: props.hintsUsed,
      streak: props.streak,
      url: window.location.origin + window.location.pathname,
    });
    const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    if (navigator.share && coarse) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard!");
    } catch {
      setToast("Could not copy");
    }
  }

  return (
    <div className="win-panel">
      <Trophy className="win-icon" aria-hidden />
      <h2>{answer.name}</h2>
      <p className="win-text">
        You found it in {n} {n === 1 ? "guess" : "guesses"}.
      </p>

      {props.mode === "daily" && (
        <>
          <div className="summary">
            <div className="stat-box">
              <div className="stat-number">{props.played}</div>
              <div className="stat-label">Played</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{props.streak}</div>
              <div className="stat-label">Streak</div>
            </div>
          </div>
          <button className="primary-button" onClick={share}>
            <Share2 aria-hidden /> Share Results
          </button>
          {toast && <p className="toast">{toast}</p>}
        </>
      )}

      {props.mode === "practice" && (
        <button className="primary-button" onClick={props.onNew}>
          <RefreshCw aria-hidden /> New disease
        </button>
      )}

      <section className="trivia">
        <h3>
          <Lightbulb aria-hidden /> Fun fact
        </h3>
        <p>{answer.trivia}</p>
        <p className="notes">{answer.notes}</p>
      </section>

      {props.mode === "daily" && (
        <>
          <div className="countdown">
            <Clock aria-hidden />
            <span>Next disease in</span>
            <span className="countdown-time">{formatCountdown(msUntilNextUtcMidnight(new Date(props.tick)))}</span>
          </div>
          <p className="win-subtext">Come back tomorrow to keep your streak going, or switch to Practice.</p>
        </>
      )}
    </div>
  );
}
