/** Bold text uses double asterisks. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-strong-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD050", options: { style: "asterisk" } }),
});
