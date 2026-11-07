/** Unordered lists use dashes at every nesting level. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-ul-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD004", options: { style: "dash" } }),
});
