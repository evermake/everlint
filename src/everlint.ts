import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect } from "effect";
import { Command } from "effect/cli";
import { version } from "../package.json";
import { ESLint } from "./backends/ESLint";
import { command } from "./Cli";

if (import.meta.main) {
  command.pipe(
    Command.run({ version }),
    Effect.catch(() => Effect.sync(() => { process.exitCode = 2; })),
    Effect.provide(ESLint.layer),
    Effect.provide(BunServices.layer),
    BunRuntime.runMain({ disableErrorReporting: true }),
  );
}
