/** Debugger statements must not be left in project source files. */
import * as ESLint from "../backends/ESLint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "no-debugger",
  filter: FileFilter.byLang(["js", "jsx", "ts", "tsx"]),
  backend: ESLint.rule({ name: "no-debugger" }),
});
