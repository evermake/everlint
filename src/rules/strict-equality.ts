/** Strict equality avoids JavaScript's implicit equality coercions. */
import * as ESLint from "../backends/ESLint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "strict-equality",
  filter: FileFilter.byLang(["js", "jsx", "ts", "tsx"]),
  backend: ESLint.rule({ name: "eqeqeq", options: ["always"] }),
});
