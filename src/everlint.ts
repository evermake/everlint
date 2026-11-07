import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect, FileSystem, Path, Schema } from "effect";
import { Argument, Command } from "effect/cli";
import type { PlatformError } from "effect/PlatformError";
import { version } from "../package.json";

export interface Diagnostic {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly rule: string;
  readonly message: string;
}

const rules = [
  {
    marker: "everlint:placeholder",
    rule: "no-placeholder",
    message: "Replace this everlint placeholder with finished work.",
  },
  {
    marker: "everlint:skip-file",
    rule: "no-skip-file",
    message: "Project files must not opt out of everlint checks.",
  },
] as const;

export function lintText(file: string, text: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const [index, line] of text.split(/\r\n|\n|\r/).entries()) {
    const match = /^[\t ]*(?:\/\/|#|<!--)[\t ]*(everlint:(?:placeholder|skip-file))\b/.exec(line);
    if (!match) continue;
    for (const rule of rules) {
      if (match[1] === rule.marker) {
        diagnostics.push({
          file,
          line: index + 1,
          column: line.indexOf(rule.marker) + 1,
          rule: rule.rule,
          message: rule.message,
        });
      }
    }
  }
  return diagnostics;
}

const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
  ".json", ".jsonc", ".md", ".mdx", ".yaml", ".yml", ".toml",
  ".css", ".html", ".sh", ".txt",
]);

class InvalidRoot extends Schema.TaggedError<InvalidRoot>()("InvalidRoot", {
  message: Schema.String,
}) {}

export const lintProject = Effect.fn("lintProject")(function*(root: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absoluteRoot = path.resolve(root);
  const info = yield* fs.lstat(absoluteRoot);
  if (info.type !== "Directory") {
    return yield* new InvalidRoot({ message: `Expected a project directory: ${root}` });
  }

  let files = 0;
  const diagnostics: Diagnostic[] = [];
  const visit = Effect.fnUntraced(function*(directory: string): Effect.fn.Return<void, PlatformError> {
    const entries = yield* fs.readDirectoryEntries(directory);
    for (const entry of entries.toSorted((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const file = path.join(directory, entry.name);
      const type = entry.type === "Unknown" ? (yield* fs.lstat(file)).type : entry.type;
      if (type === "Directory") {
        if (!ignoredDirectories.has(entry.name)) yield* visit(file);
      } else if (type === "File" && textExtensions.has(path.extname(entry.name).toLowerCase())) {
        const text = yield* fs.readFileString(file);
        if (text.includes("\0")) continue;
        files++;
        diagnostics.push(...lintText(path.relative(absoluteRoot, file).split(path.sep).join("/"), text));
      }
    }
  });

  yield* visit(absoluteRoot);
  return { files, diagnostics };
});

const command = Command.make(
  "everlint",
  {
    directory: Argument.String("directory").pipe(
      Argument.withDescription("Project directory to lint (defaults to the current directory)"),
      Argument.withDefault("."),
    ),
  },
  Effect.fn("lint")(function*({ directory }) {
    const result = yield* lintProject(directory);
    for (const diagnostic of result.diagnostics) {
      yield* Console.log(
        `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}: ${diagnostic.rule}: ${diagnostic.message}`,
      );
    }
    yield* Console.log(`Checked ${result.files} file(s); found ${result.diagnostics.length} problem(s).`);
    yield* Effect.sync(() => { process.exitCode = result.diagnostics.length > 0 ? 1 : 0; });
  }, Effect.catch((error) => Effect.gen(function*() {
    yield* Console.error(`everlint: ${error.message}`);
    yield* Effect.sync(() => { process.exitCode = 2; });
  }))),
).pipe(Command.withDescription("Lint project files with everlint's experimental policy rules."));

if (import.meta.main) {
  command.pipe(
    Command.run({ version }),
    Effect.catch(() => Effect.sync(() => { process.exitCode = 2; })),
    Effect.provide(BunServices.layer),
    BunRuntime.runMain({ disableErrorReporting: true }),
  );
}
