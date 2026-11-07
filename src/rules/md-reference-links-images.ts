/** Full and collapsed references have definitions; ambiguous shortcuts are unchecked. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-reference-links-images",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD052", options: { shortcut_syntax: false, ignored_labels: ["x"] } }),
});
