import { Effect, Schema } from "effect";
import { ESLint } from "./backends/ESLint";
import type { Implementation as ESLintImplementation } from "./backends/ESLint";
import type { LintResult } from "./Diagnostic";
import * as Project from "./Project";
import type * as Rule from "./Rule";
import { rules as builtinRules } from "./rules";

/** Add new backend implementations here as their adapters become available. */
export type SupportedRule = Rule.Rule<ESLintImplementation>;

export class InvalidRules extends Schema.TaggedError<InvalidRules>()("InvalidRules", {
  message: Schema.String,
}) {}

export const lintProject = Effect.fn("lintProject")(function*(
  root: string,
  rules: readonly SupportedRule[] = builtinRules,
) {
  const ids = new Set<string>();
  for (const rule of rules) {
    if (ids.has(rule.id)) {
      return yield* new InvalidRules({ message: `Duplicate rule ID: ${rule.id}` });
    }
    ids.add(rule.id);
  }

  const plan = yield* Project.plan(root, rules);
  const backend = yield* ESLint;
  const diagnostics = yield* backend.run(plan);
  return {
    files: plan.files.length,
    diagnostics: diagnostics.toSorted((a, b) =>
      (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) ||
      a.line - b.line || a.column - b.column ||
      (a.rule ?? "").localeCompare(b.rule ?? "") || a.message.localeCompare(b.message)),
  } satisfies LintResult;
});
