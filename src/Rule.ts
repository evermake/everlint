import type { FileFilter } from "./FileFilter";

/** Backend-specific data stays outside the common rule contract. */
export interface Implementation {
  readonly tool: string;
}

export interface Rule<Backend extends Implementation = Implementation> {
  readonly id: string;
  readonly filter: FileFilter;
  readonly backend: Backend;
}

export const make = <const Backend extends Implementation>(
  definition: Rule<Backend>,
): Rule<Backend> => definition;
