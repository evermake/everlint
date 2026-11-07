import { Console, Effect } from "effect";
import { Argument, Command } from "effect/cli";
import { lintProject } from "./Linter";

export const command = Command.make(
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
        `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}: ${diagnostic.rule ?? diagnostic.tool}: ${diagnostic.message}`,
      );
    }
    yield* Console.log(`Checked ${result.files} file(s); found ${result.diagnostics.length} problem(s).`);
    yield* Effect.sync(() => {
      process.exitCode = result.diagnostics.length > 0 ? 1 : 0;
    });
  }, Effect.catch((error) => Effect.gen(function*() {
    yield* Console.error(`everlint: ${error.message}`);
    yield* Effect.sync(() => { process.exitCode = 2; });
  }))),
).pipe(Command.withDescription("Lint project files with everlint's policy rules."));
