export type Vaccine = "Yes" | "Yes (limited)" | "No";
export type Etiology = "Virus" | "Bacteria" | "Protozoa" | "Fungus" | "Parasite";
export type Notifiable = "Yes" | "No";
export type Pattern = "Endemic" | "Epidemic-prone" | "Pandemic" | "Eradicated" | "Sporadic";

export const VACCINES: Vaccine[] = ["Yes", "Yes (limited)", "No"];
export const ETIOLOGIES: Etiology[] = ["Virus", "Bacteria", "Protozoa", "Fungus", "Parasite"];
export const NOTIFIABLES: Notifiable[] = ["Yes", "No"];
export const PATTERNS: Pattern[] = ["Endemic", "Epidemic-prone", "Pandemic", "Eradicated", "Sporadic"];

export interface Disease {
  name: string;
  vaccine: Vaccine;
  etiology: Etiology;
  incubationMin: number;
  incubationMax: number;
  treatment: string;
  transmission: string;
  reservoir: string;
  r0: number;
  cfr: number;
  notifiable: Notifiable;
  pattern: Pattern;
  smallHint: string;
  bigHint: string;
  trivia: string;
  notes: string;
}

export type Match = "exact" | "partial" | "none";
export type Direction = "up" | "down";

export interface CellResult {
  match: Match;
  direction?: Direction;
}
