/** Markdown headings use ATX syntax without closing hashes. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-heading-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD003", options: { style: "atx" } }),
});
