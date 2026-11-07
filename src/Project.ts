import { Effect, FileSystem, Path, Schema } from "effect";
import type { PlatformError } from "effect/PlatformError";
import * as File from "./File";
import type * as Rule from "./Rule";

/** Files with the same applicable rules share one configuration block. */
export interface Group<Backend extends Rule.Implementation> {
  readonly rules: readonly Rule.Rule<Backend>[];
  readonly files: readonly string[];
}

export interface Plan<Backend extends Rule.Implementation> {
  readonly root: string;
  /** Only files with at least one applicable rule, relative to root. */
  readonly files: readonly string[];
  readonly groups: readonly Group<Backend>[];
}

export class InvalidRoot extends Schema.TaggedError<InvalidRoot>()("InvalidRoot", {
  message: Schema.String,
}) {}

const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);

export const plan = Effect.fn("Project.plan")(function*<Backend extends Rule.Implementation>(
  root: string,
  rules: readonly Rule.Rule<Backend>[],
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absoluteRoot = path.resolve(root);
  const info = yield* fs.lstat(absoluteRoot);
  if (info.type !== "Directory") {
    return yield* new InvalidRoot({ message: `Expected a project directory: ${root}` });
  }

  const selectors = rules.map((rule, index) => ({
    rule,
    index,
  }));
  const groups = new Map<string, { rules: Rule.Rule<Backend>[]; files: string[] }>();
  const files: string[] = [];
  const visit = Effect.fnUntraced(function*(directory: string): Effect.fn.Return<void, PlatformError> {
    const entries = yield* fs.readDirectoryEntries(directory);
    for (const entry of entries.toSorted((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const absoluteFile = path.join(directory, entry.name);
      const type = entry.type === "Unknown" ? (yield* fs.lstat(absoluteFile)).type : entry.type;
      if (type === "Directory") {
        if (!ignoredDirectories.has(entry.name)) yield* visit(absoluteFile);
      } else if (type === "File") {
        const file = File.make(path.relative(absoluteRoot, absoluteFile).split(path.sep).join("/"));
        const selected = selectors.filter(({ rule }) => rule.filter(file));
        if (selected.length === 0) continue;

        const key = selected.map(({ index }) => index).join(",");
        const group = groups.get(key) ?? { rules: selected.map(({ rule }) => rule), files: [] };
        group.files.push(file.path);
        groups.set(key, group);
        files.push(file.path);
      }
    }
  });

  if (rules.length > 0) yield* visit(absoluteRoot);
  return {
    root: absoluteRoot,
    files: files.toSorted(),
    groups: [...groups.values()].map(({ rules, files }) => ({
      rules,
      files: files.toSorted(),
    })),
  } satisfies Plan<Backend>;
});
