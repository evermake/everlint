import { dual } from "effect/Function";
import type { File, Language } from "./File";

/** A pure predicate over file metadata; discovery never reads file contents. */
export type FileFilter = (file: File) => boolean;

export const byLang: {
  (languages: readonly Language[]): FileFilter;
  (file: File, languages: readonly Language[]): boolean;
} = dual(2, (file: File, languages: readonly Language[]): boolean =>
  file.language !== undefined && languages.includes(file.language));
