import { describe, it, expect } from "vitest";
import { buildShareText } from "../src/game/share";
import type { Disease } from "../src/game/types";

const answer: Disease = {
  name: "Malaria", vaccine: "Yes (limited)", etiology: "Protozoa", incubationMin: 7, incubationMax: 30,
  treatment: "Antiparasitic (Artemisinin)", transmission: "Vector (Mosquito)", reservoir: "Human",
  r0: 10, cfr: 1, notifiable: "Yes", pattern: "Endemic", smallHint: "", bigHint: "", trivia: "", notes: "",
};
const wrong: Disease = {
  ...answer, name: "Dengue", vaccine: "Yes", etiology: "Virus", incubationMin: 4, incubationMax: 40,
  treatment: "Supportive (Fluids)", reservoir: "Human, Animal (Primate)", r0: 4, cfr: 2, pattern: "Epidemic-prone",
};

describe("buildShareText", () => {
  it("formats a 2-guess win with hint and streak", () => {
    const text = buildShareText({
      date: "2026-10-08", guesses: [wrong, answer], answer, hintsUsed: 1, streak: 3, url: "https://x.y/z/",
    });
    expect(text).toBe(
      [
        "Plagdle Sophia 2026-10-08 🦠",
        "Solved in 2 guesses (💡1 hint)",
        "🔥 3-day streak",
        "",
        "🟨🟥🟥🟥🟥🟩🟨🟥🟨🟩🟥",
        "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩",
        "",
        "https://x.y/z/",
      ].join("\n"),
    );
  });
  it("singular guess, no hints, streak 1 omitted", () => {
    const text = buildShareText({ date: "2026-10-08", guesses: [answer], answer, hintsUsed: 0, streak: 1, url: "u" });
    expect(text.split("\n")[1]).toBe("Solved in 1 guess");
    expect(text).not.toContain("streak");
  });
});
