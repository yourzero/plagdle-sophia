import { Info } from "lucide-react";

export default function HowToPlay() {
  return (
    <section className="card instructions">
      <h3>
        <Info aria-hidden /> How to play
      </h3>
      <ul>
        <li>One daily puzzle, the same for everyone, new at midnight UTC.</li>
        <li>Guess the disease. Each guess shows how its attributes compare with the answer.</li>
        <li>Green = exact match. Yellow = partial match (same family, or close number). Red = no match.</li>
        <li>Numbers show an arrow when the answer is higher ↑ or lower ↓.</li>
        <li>R0 counts as close within ±1. CFR counts as close within ±2 points.</li>
        <li>Hint 1 unlocks after 3 guesses. Hint 2 after 6.</li>
        <li>Practice mode gives unlimited random diseases and does not affect your streak.</li>
        <li>Values are first-pass and may be wrong. Read the note on the win screen.</li>
      </ul>
    </section>
  );
}
