import { ChevronDown, ChevronUp, Trophy, X } from "lucide-react";
import { COLUMNS, compareGuess } from "../game/compare";
import type { Disease } from "../game/types";

interface Props {
  guesses: Disease[];
  answer: Disease;
}

export default function GuessTable({ guesses, answer }: Props) {
  if (guesses.length === 0) return null;
  return (
    <div className="table-wrapper">
      <table className="guess-table">
        <thead>
          <tr>
            <th>Disease</th>
            {COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guesses.map((g) => {
            const cells = compareGuess(g, answer);
            const correct = g.name === answer.name;
            return (
              <tr key={g.name}>
                <td>
                  <div className="disease-cell">
                    {correct ? <Trophy className="icon trophy" aria-label="Correct" /> : <X className="icon wrong" aria-label="Wrong" />}
                    <span>{g.name}</span>
                  </div>
                </td>
                {COLUMNS.map((c, i) => {
                  const r = cells[i];
                  const value = c.kind === "numeric" ? `${g[c.key]}${c.suffix ?? ""}` : g[c.key];
                  return (
                    <td key={c.key}>
                      <div className={`cell ${r.match}`}>
                        <span>{value}</span>
                        {r.direction === "up" && <ChevronUp className="arrow" aria-label="Higher" />}
                        {r.direction === "down" && <ChevronDown className="arrow" aria-label="Lower" />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
