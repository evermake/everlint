/** Markdown allows at most one consecutive blank line outside code blocks. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-multiple-blanks",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD012", options: { maximum: 1 } }),
});
