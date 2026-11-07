/** Italics use asterisks. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-emphasis-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD049", options: { style: "asterisk" } }),
});
