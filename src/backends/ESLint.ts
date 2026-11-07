import * as typescriptParser from "@typescript-eslint/parser";
import { Context, Effect, Layer } from "effect";
import { ESLint as Engine } from "eslint";
import type { Linter } from "eslint";
import { escape } from "minimatch";
import { posix, relative, resolve, sep } from "node:path";
import { BackendError } from "../Backend";
import type { Backend } from "../Backend";
import type { Diagnostic } from "../Diagnostic";
import * as File from "../File";
import * as FileFilter from "../FileFilter";
import type { Plan } from "../Project";

export interface Implementation {
  readonly tool: "eslint";
  /** ESLint core rule ID or a plugin-qualified ID. */
  readonly name: string;
  readonly options?: readonly unknown[];
  /** Imported plugin objects, not package names resolved from the target project. */
  readonly plugins?: Readonly<Record<string, Engine.Plugin>>;
}

export const rule = (definition: Omit<Implementation, "tool">): Implementation => ({
  ...definition,
  tool: "eslint",
});

export interface Configuration {
  readonly config: Linter.Config[];
  /** Resolve underlying rule IDs in the context of each file's applicable rules. */
  readonly ruleIds: ReadonlyMap<string, ReadonlyMap<string, string>>;
}

const literalPath = (file: string) => escape(file).replace(/^[!#]/, "\\$&");
const isTypeScript = FileFilter.byLang(["ts", "tsx"]);

export const configure = (plan: Plan<Implementation>): Configuration => {
  const ruleIds = new Map<string, ReadonlyMap<string, string>>();
  const config: Linter.Config[] = [{
    name: "everlint/language",
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: { reportUnusedDisableDirectives: "off" },
  }];
  const files = plan.files.map(File.make);
  const typescriptFiles = files.filter(isTypeScript);
  if (typescriptFiles.length > 0) {
    config.push({
      name: "everlint/typescript",
      files: typescriptFiles.map(({ path }) => literalPath(path)),
      languageOptions: {
        parser: typescriptParser,
        parserOptions: { project: false, projectService: false },
      },
    });
  }
  const commonjsFiles = files.filter(({ extension }) => extension === ".cjs" || extension === ".cts");
  if (commonjsFiles.length > 0) {
    config.push({
      name: "everlint/commonjs",
      files: commonjsFiles.map(({ path }) => literalPath(path)),
      languageOptions: { sourceType: "commonjs" },
    });
  }

  for (const [index, group] of plan.groups.entries()) {
    const ids = new Map<string, string>();
    const plugins = new Map<string, Engine.Plugin>();
    const rules = new Map<string, Linter.RuleEntry>();
    for (const rule of group.rules) {
      const implementation = rule.backend;
      const existing = ids.get(implementation.name);
      if (existing !== undefined) {
        throw new Error(
          `Rules "${existing}" and "${rule.id}" both configure ESLint rule "${implementation.name}" for ${group.files[0]}.`,
        );
      }
      ids.set(implementation.name, rule.id);
      for (const [name, plugin] of Object.entries(implementation.plugins ?? {})) {
        if (plugins.has(name) && plugins.get(name) !== plugin) {
          throw new Error(`Conflicting ESLint plugin "${name}" for ${group.files[0]}.`);
        }
        plugins.set(name, plugin);
      }
      rules.set(implementation.name, ["error", ...(implementation.options ?? [])]);
    }
    for (const file of group.files) ruleIds.set(file, ids);
    config.push({
      name: `everlint/groups/${index}`,
      // Preserve the planner's exact selection instead of reimplementing its filters.
      files: group.files.map(literalPath),
      plugins: Object.fromEntries(plugins),
      rules: Object.fromEntries(rules),
    });
  }
  return { config, ruleIds };
};

const run = Effect.fn("ESLint.run")((plan: Plan<Implementation>) => Effect.tryPromise({
  async try() {
    if (plan.files.length === 0) return [];
    const { config, ruleIds } = configure(plan);
    const engine = new Engine({
      cwd: plan.root,
      overrideConfigFile: true,
      overrideConfig: config,
      allowInlineConfig: false,
      globInputPaths: false,
      concurrency: "off",
    });
    const results = await engine.lintFiles(plan.files.map((file) => resolve(plan.root, file)));
    const diagnostics: Diagnostic[] = [];
    for (const result of results) {
      const file = relative(plan.root, result.filePath).split(sep).join(posix.sep);
      for (const message of result.messages) {
        diagnostics.push({
          file,
          line: message.line ?? 1,
          column: message.column ?? 1,
          ...(message.endLine === undefined ? {} : { endLine: message.endLine }),
          ...(message.endColumn === undefined ? {} : { endColumn: message.endColumn }),
          tool: "eslint",
          rule: message.ruleId === null ? null : ruleIds.get(file)?.get(message.ruleId) ?? message.ruleId,
          message: message.message,
        });
      }
    }
    return diagnostics;
  },
  catch: (cause) => new BackendError({
    tool: "eslint",
    message: cause instanceof Error ? cause.message : String(cause),
    cause,
  }),
}));

export class ESLint extends Context.Service<ESLint, Backend<Implementation>>()(
  "everlint/backends/ESLint",
) {
  static readonly layer = Layer.succeed(ESLint, { run });
}
