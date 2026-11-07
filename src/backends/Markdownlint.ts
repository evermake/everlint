import { Context, Effect, Layer } from "effect";
import type { Configuration, ConfigurationStrict, MarkdownItFactory, Rule as CustomRule } from "markdownlint";
import { lint } from "markdownlint/promise";
import { posix, relative, resolve, sep } from "node:path";
import { BackendError } from "../Backend";
import type { Backend } from "../Backend";
import type { Diagnostic } from "../Diagnostic";
import type { Plan } from "../Project";

export type RuleName = Extract<keyof ConfigurationStrict, `MD${number}`>;

export type RuleOptions<Name extends RuleName> = Omit<
  Extract<ConfigurationStrict[Name], object>,
  "enabled" | "severity"
>;

export type { CustomRule };

export interface BuiltinImplementation<Name extends RuleName = RuleName> {
  readonly tool: "markdownlint";
  /** Canonical built-in rule ID, not an alias or a tag. */
  readonly name: Name;
  readonly options?: RuleOptions<Name>;
}

export interface CustomImplementation {
  readonly tool: "markdownlint";
  /** An imported rule object; its first name is its canonical ID. */
  readonly customRule: CustomRule;
  readonly options?: Readonly<Record<string, unknown>> & { readonly enabled?: never; readonly severity?: never };
  /** Required by legacy rules that use the markdown-it parser. */
  readonly markdownItFactory?: MarkdownItFactory;
}

export type Implementation = BuiltinImplementation | CustomImplementation;

export function rule<const Name extends RuleName>(
  definition: Omit<BuiltinImplementation<Name>, "tool">,
): BuiltinImplementation<Name>;
export function rule(definition: Omit<CustomImplementation, "tool">): CustomImplementation;
export function rule(
  definition: Omit<BuiltinImplementation, "tool"> | Omit<CustomImplementation, "tool">,
): Implementation {
  return { ...definition, tool: "markdownlint" };
}

// Keep runtime validation aligned with the pinned library's public configuration type.
const ruleNames: Readonly<Record<RuleName, true>> = {
  MD001: true, MD003: true, MD004: true, MD005: true, MD007: true,
  MD009: true, MD010: true, MD011: true, MD012: true, MD013: true,
  MD014: true, MD018: true, MD019: true, MD020: true, MD021: true,
  MD022: true, MD023: true, MD024: true, MD025: true, MD026: true,
  MD027: true, MD028: true, MD029: true, MD030: true, MD031: true,
  MD032: true, MD033: true, MD034: true, MD035: true, MD036: true,
  MD037: true, MD038: true, MD039: true, MD040: true, MD041: true,
  MD042: true, MD043: true, MD044: true, MD045: true, MD046: true,
  MD047: true, MD048: true, MD049: true, MD050: true, MD051: true,
  MD052: true, MD053: true, MD054: true, MD055: true, MD056: true,
  MD058: true, MD059: true, MD060: true,
};

export interface Batch {
  readonly files: readonly string[];
  readonly config: Configuration;
  readonly ruleIds: ReadonlyMap<string, string>;
  readonly customRules: readonly CustomRule[];
  readonly markdownItFactory?: MarkdownItFactory;
}

export const configure = (plan: Plan<Implementation>): readonly Batch[] => plan.groups.map((group) => {
  const ids = new Map<string, string>();
  const customRules: CustomRule[] = [];
  let markdownItFactory: MarkdownItFactory | undefined;
  const config: Record<string, unknown> = { default: false };
  for (const rule of group.rules) {
    const implementation = rule.backend;
    const custom = "customRule" in implementation ? implementation.customRule : undefined;
    const name = "name" in implementation ? implementation.name : custom?.names[0];
    if (!name || ["DEFAULT", "EXTENDS", "$SCHEMA"].includes(name.toUpperCase())) {
      throw new Error(`Invalid markdownlint rule name: ${name}.`);
    }
    if (!custom && !Object.hasOwn(ruleNames, name)) {
      throw new Error(`Unknown markdownlint rule: ${name}. Use a canonical built-in rule ID.`);
    }
    const canonical = name.toUpperCase();
    const existing = ids.get(canonical);
    if (existing !== undefined) {
      throw new Error(
        `Rules "${existing}" and "${rule.id}" both configure markdownlint rule "${name}" for ${group.files[0]}.`,
      );
    }
    ids.set(canonical, rule.id);
    if (custom) customRules.push(custom);
    if ("markdownItFactory" in implementation && implementation.markdownItFactory !== undefined) {
      if (markdownItFactory !== undefined && markdownItFactory !== implementation.markdownItFactory) {
        throw new Error(`Conflicting markdown-it parser factories for ${group.files[0]}.`);
      }
      markdownItFactory = implementation.markdownItFactory;
    }
    config[name] = { ...implementation.options, enabled: true };
  }
  return {
    files: group.files,
    config,
    ruleIds: ids,
    customRules,
    ...(markdownItFactory === undefined ? {} : { markdownItFactory }),
  };
});

const run = Effect.fn("Markdownlint.run")((plan: Plan<Implementation>) => Effect.tryPromise({
  async try() {
    if (plan.files.length === 0) return [];
    const batches = configure(plan);
    const diagnostics: Diagnostic[] = [];
    for (const batch of batches) {
      const results = await lint({
        files: batch.files.map((file) => resolve(plan.root, file)),
        config: batch.config,
        customRules: [...batch.customRules],
        ...(batch.markdownItFactory === undefined ? {} : { markdownItFactory: batch.markdownItFactory }),
        noInlineConfig: true,
      });
      for (const [filePath, messages] of Object.entries(results)) {
        const file = relative(plan.root, filePath).split(sep).join(posix.sep);
        const seen = new Set<string>();
        for (const message of messages) {
          const column = message.errorRange?.[0] ?? 1;
          const length = message.errorRange?.[1];
          const name = message.ruleNames[0];
          const diagnostic: Diagnostic = {
            file,
            line: message.lineNumber,
            column,
            ...(length === undefined ? {} : { endLine: message.lineNumber, endColumn: column + length }),
            tool: "markdownlint",
            rule: name === undefined ? null : batch.ruleIds.get(name.toUpperCase()) ?? name,
            message: message.errorDetail
              ? `${message.ruleDescription}: ${message.errorDetail}`
              : message.ruleDescription,
          };
          // Atomic multi-line fixes can emit identical reports with different edits.
          const key = JSON.stringify(diagnostic);
          if (!seen.has(key)) {
            seen.add(key);
            diagnostics.push(diagnostic);
          }
        }
      }
    }
    return diagnostics;
  },
  catch: (cause) => new BackendError({
    tool: "markdownlint",
    message: cause instanceof Error ? cause.message : String(cause),
    cause,
  }),
}));

export class Markdownlint extends Context.Service<Markdownlint, Backend<Implementation>>()(
  "everlint/backends/Markdownlint",
) {
  static readonly layer = Layer.succeed(Markdownlint, { run });
}
