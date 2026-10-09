import { useState } from "react";
import type { Disease } from "../game/types";
import { findDisease, suggest } from "../game/compare";

interface Props {
  diseases: Disease[];
  guessed: string[];
  onGuess: (name: string) => void;
}

export default function GuessInput({ diseases, guessed, onGuess }: Props) {
  const [text, setText] = useState("");
  const suggestions = suggest(text, diseases, guessed);

  function submit(name: string) {
    const d = findDisease(name, diseases);
    if (!d) return;
    onGuess(d.name);
    setText("");
  }

  return (
    <div className="input-wrapper">
      <input
        type="text"
        className="guess-input"
        value={text}
        placeholder="Type a disease name..."
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text) {
            if (findDisease(text, diseases)) submit(text);
            else if (suggestions.length === 1) submit(suggestions[0].name);
          }
        }}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions" role="listbox">
          {suggestions.map((d) => (
            <li key={d.name} role="option" aria-selected={false} onMouseDown={() => submit(d.name)}>
              {d.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
