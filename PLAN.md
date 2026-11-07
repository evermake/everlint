## Step 1

- [x] scaffold project with Bun
- [x] implement minimal 1 TS module for linting project files with some toy rules
- [x] setup building `everlint` as a single executable
- [x] configure CI workflow to lint `everlint` with itself on PRs

## Step 2

- [x] Design rules API
- [x] Add support for defining rules backed by ESLint rules

### Rule API

- Each rule corresponds to a single TypeScript module in `src/rules/`.

Rule should be in format like this:

```ts
/**
 * Description of a rule purpose in module doc...
 */

import * as ESLint from "../backends/ESLint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "strict-equality",
  filter: FileFilter.byLang(["ts", "js"]),
  backend: ESLint.rule({ name: "eqeqeq", options: ["always"] }),
});
```

Filters are pure predicates over a file's root-relative path, extension and language. `FileFilter.byLang(["ts", "js"])` includes `.ts`, `.mts`, `.cts`, `.js`, `.mjs` and `.cjs`, but not `.tsx` or `.jsx`. Languages are deduced from extensions. `byLang` supports both `byLang(file, languages)` and `byLang(languages)(file)`. Filters are plain functions and can use ordinary `&&`, `||` and `!` operators, for example `(file) => FileFilter.byLang(file, ["ts"]) && !file.path.endsWith(".d.ts")`. ESLint implementations may supply imported `plugins` objects. Rules are explicitly registered in `src/rules/index.ts` for standalone builds.

### Execution

- `Project.plan` discovers paths without reading file contents, skips dependency, build, coverage and Git directories, and groups files by applicable rule set.
- Each backend owns configuration generation, batched execution and conversion to common diagnostics. The generic rule and backend contracts do not depend on ESLint; the linter dispatches ESLint and markdownlint implementations.
- The ESLint adapter generates a complete flat config and calls `lintFiles` once with exact selected paths (or not at all for an empty plan). Project-local configs and inline configuration are disabled. Conflicting rule or plugin bindings on overlapping files are rejected instead of silently overridden.
- Diagnostics retain everlint rule IDs, tool and one-based locations. Parser/tool diagnostics have a null rule ID. Every issue is a violation and exits with status 1; execution/configuration failures exit with status 2.

Only syntax-based rules are supported for now. TypeScript parsing uses `@typescript-eslint/parser` without projects or type services, backed by the TypeScript 6 compatibility API; typechecking still uses TypeScript 7. The build externalizes ESLint's optional `jiti` config loader, which is never used because configuration-file discovery is disabled.

## Step 3

- [x] Add support for rules backed by [markdownlint](https://github.com/davidanson/markdownlint)

Markdownlint rules use the same rule contract and plain file filters:

```ts
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-hard-tabs",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD010", options: { code_blocks: false } }),
});
```

- Built-in rule names are canonical IDs (`MD010`, not aliases or tags), checked against the pinned library's public configuration types and validated at runtime. Options are typed for the selected rule and exclude enablement and severity.
- Custom rules supply an imported markdownlint rule object with `Markdownlint.rule({ customRule: implementation, options: { /* rule options */ } })`. The first entry in `implementation.names` is its canonical ID. Custom names and aliases are validated by markdownlint; overlapping definitions are rejected case-insensitively. Legacy markdown-it rules also supply an imported `markdownItFactory`; conflicting factories on overlapping files are rejected.
- Discovery and filter evaluation run once. Plans are projected and regrouped per backend, so rules for another tool do not fragment batches. Files selected by both backends are counted only once.
- Markdownlint runs once per distinct applicable rule set, with all other rules disabled. Only explicit file paths are passed; local configuration and inline overrides are not used. Empty backend plans do not invoke or require a service.
- Overlapping definitions of the same underlying Markdown rule are rejected. Diagnostics preserve everlint rule IDs, descriptions, details and one-based locations; missing column information falls back to column 1. Identical reports that differ only in fix edits become one violation. Execution and configuration errors use the existing backend error channel and CLI status 2.
- `md-no-prose-wrap` keeps paragraphs and list-item prose on one source line where safe.
- Tests live in `test/` and run with `bun run test` (Vitest). Only the custom `md-no-prose-wrap` rule has tests; delegated markdownlint rules do not get additional test suites. Typechecking includes the tests and Vitest configuration; CI runs the suite before building. The port preserves the original rendering/fix cases and adapts the CLI test to everlint's check-only behavior.
