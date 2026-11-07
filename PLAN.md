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

Filters are pure predicates over a file's root-relative path, extension and language.
`FileFilter.byLang(["ts", "js"])` includes `.ts`, `.mts`, `.cts`, `.js`, `.mjs`
and `.cjs`, but not `.tsx` or `.jsx`. Languages are deduced from extensions.
`byLang` supports both `byLang(file, languages)` and `byLang(languages)(file)`.
Filters are plain functions and can use ordinary `&&`, `||` and `!` operators,
for example `(file) => FileFilter.byLang(file, ["ts"]) && !file.path.endsWith(".d.ts")`.
ESLint implementations may supply imported `plugins` objects. Rules are
explicitly registered in `src/rules/index.ts` for standalone builds.

### Execution

- `Project.plan` discovers paths without reading file contents, skips dependency,
  build, coverage and Git directories, and groups files by applicable rule set.
- Each backend owns configuration generation, batched execution and conversion
  to common diagnostics. The generic rule and backend contracts do not depend on
  ESLint; the linter currently accepts only ESLint implementations.
- The ESLint adapter generates a complete flat config and calls `lintFiles` once
  with exact selected paths (or not at all for an empty plan). Project-local
  configs and inline configuration are disabled. Conflicting rule or plugin
  bindings on overlapping files are rejected instead of silently overridden.
- Diagnostics retain everlint rule IDs, tool and one-based locations.
  Parser/tool diagnostics have a null rule ID. Every issue is a violation and
  exits with status 1; execution/configuration failures exit with status 2.

Only syntax-based rules are supported for now. TypeScript parsing uses
`@typescript-eslint/parser` without projects or type services, backed by the
TypeScript 6 compatibility API; typechecking still uses TypeScript 7. The build
externalizes ESLint's optional `jiti` config loader, which is never used because
configuration-file discovery is disabled.
