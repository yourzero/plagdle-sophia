import { describe, it, expect } from "vitest";
import {
  compareCategorical,
  compareNumeric,
  compareGuess,
  findDisease,
  suggest,
  COLUMNS,
} from "../src/game/compare";
import type { Disease } from "../src/game/types";

const base: Disease = {
  name: "Malaria",
  vaccine: "Yes (limited)",
  etiology: "Protozoa",
  incubationMin: 7,
  incubationMax: 30,
  treatment: "Antiparasitic (Artemisinin)",
  transmission: "Vector (Mosquito)",
  reservoir: "Human",
  r0: 10,
  cfr: 1,
  notifiable: "Yes",
  pattern: "Endemic",
  smallHint: "s",
  bigHint: "b",
  trivia: "t",
  notes: "n",
};
const other: Disease = {
  ...base,
  name: "Dengue",
  vaccine: "Yes",
  etiology: "Virus",
  incubationMin: 4,
  incubationMax: 40,
  treatment: "Supportive (Fluids)",
  transmission: "Vector (Mosquito)",
  reservoir: "Human, Animal (Primate)",
  r0: 4,
  cfr: 2,
  notifiable: "Yes",
  pattern: "Epidemic-prone",
};

describe("compareCategorical", () => {
  it("exact, case-insensitive", () => {
    expect(compareCategorical("Virus", "virus", true)).toEqual({ match: "exact" });
  });
  it("partial when guess contains answer first word", () => {
    expect(compareCategorical("Yes (limited)", "Yes", true)).toEqual({ match: "partial" });
  });
  it("partial when answer contains guess first word", () => {
    expect(compareCategorical("Vector", "Vector (Tick)", true)).toEqual({ match: "partial" });
  });
  it("strips punctuation from first word", () => {
    expect(compareCategorical("Human, Animal (Primate)", "Human", true)).toEqual({ match: "partial" });
  });
  it("none otherwise", () => {
    expect(compareCategorical("Virus", "Bacteria", true)).toEqual({ match: "none" });
  });
  it("no partial when disallowed", () => {
    expect(compareCategorical("Yes (limited)", "Yes", false)).toEqual({ match: "none" });
  });
});

describe("compareNumeric", () => {
  it("exact", () => expect(compareNumeric(5, 5, 0)).toEqual({ match: "exact" }));
  it("up when guess lower", () => expect(compareNumeric(3, 5, 0)).toEqual({ match: "none", direction: "up" }));
  it("down when guess higher", () => expect(compareNumeric(9, 5, 0)).toEqual({ match: "none", direction: "down" }));
  it("partial inside close band, keeps direction", () =>
    expect(compareNumeric(4, 5, 1)).toEqual({ match: "partial", direction: "up" }));
  it("none just outside close band", () =>
    expect(compareNumeric(7.1, 5, 2)).toEqual({ match: "none", direction: "down" }));
});

describe("compareGuess", () => {
  it("returns 11 cells in column order", () => {
    const cells = compareGuess(other, base);
    expect(cells).toHaveLength(11);
    expect(COLUMNS.map((c) => c.key)).toEqual([
      "vaccine", "etiology", "incubationMin", "incubationMax", "treatment",
      "transmission", "reservoir", "r0", "cfr", "notifiable", "pattern",
    ]);
    expect(cells[0]).toEqual({ match: "partial" });              // vaccine
    expect(cells[1]).toEqual({ match: "none" });                 // etiology
    expect(cells[2]).toEqual({ match: "none", direction: "up" }); // incubationMin 4 vs 7
    expect(cells[3]).toEqual({ match: "none", direction: "down" }); // incubationMax 40 vs 30
    expect(cells[4]).toEqual({ match: "none" });                 // treatment
    expect(cells[5]).toEqual({ match: "exact" });                // transmission
    expect(cells[6]).toEqual({ match: "partial" });              // reservoir
    expect(cells[7]).toEqual({ match: "none", direction: "up" }); // r0 4 vs 10
    expect(cells[8]).toEqual({ match: "partial", direction: "down" }); // cfr 2 vs 1
    expect(cells[9]).toEqual({ match: "exact" });                // notifiable
    expect(cells[10]).toEqual({ match: "none" });                // pattern
  });
});

describe("findDisease", () => {
  it("case-insensitive", () => {
    expect(findDisease("mALARIA", [base, other])?.name).toBe("Malaria");
  });
  it("undefined when absent", () => {
    expect(findDisease("Ebola", [base, other])).toBeUndefined();
  });
});

describe("suggest", () => {
  const list = [base, other, { ...base, name: "Mumps" }, { ...base, name: "Measles" }];
  it("substring, case-insensitive", () => {
    expect(suggest("m", list, []).map((d) => d.name)).toEqual(["Malaria", "Mumps", "Measles"]);
  });
  it("excludes guessed", () => {
    expect(suggest("m", list, ["Malaria"]).map((d) => d.name)).toEqual(["Mumps", "Measles"]);
  });
  it("caps at max", () => {
    expect(suggest("", list, [], 2)).toHaveLength(0);
    expect(suggest("a", list, [], 2)).toHaveLength(2);
  });
});
