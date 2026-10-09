import { compareGuess } from "./compare";
import type { Disease, Match } from "./types";

const EMOJI: Record<Match, string> = { exact: "🟩", partial: "🟨", none: "🟥" };

export function emojiRow(guess: Disease, answer: Disease): string {
  return compareGuess(guess, answer).map((c) => EMOJI[c.match]).join("");
}

export interface ShareOpts {
  date: string;
  guesses: Disease[];
  answer: Disease;
  hintsUsed: number;
  streak: number;
  url: string;
}

export function buildShareText({ date, guesses, answer, hintsUsed, streak, url }: ShareOpts): string {
  const n = guesses.length;
  const lines = [`Plagdle Sophia ${date} 🦠`];
  let solved = `Solved in ${n} ${n === 1 ? "guess" : "guesses"}`;
  if (hintsUsed > 0) solved += ` (💡${hintsUsed} ${hintsUsed === 1 ? "hint" : "hints"})`;
  lines.push(solved);
  if (streak > 1) lines.push(`🔥 ${streak}-day streak`);
  lines.push("");
  for (const g of guesses) lines.push(emojiRow(g, answer));
  lines.push("", url);
  return lines.join("\n");
}
