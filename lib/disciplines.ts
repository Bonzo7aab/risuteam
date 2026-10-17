/** Shared discipline list for admin forms and validation. */
export const DISCIPLINE_OPTIONS = ["Judo", "Karate", "Gimnastyka"] as const;

export type Discipline = (typeof DISCIPLINE_OPTIONS)[number];

export function isDiscipline(value: string): value is Discipline {
  return (DISCIPLINE_OPTIONS as readonly string[]).includes(value);
}
