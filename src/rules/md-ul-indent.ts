/** Unordered lists start at column one and use two spaces per nesting level. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-ul-indent",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD007", options: { indent: 2, start_indented: false } }),
});
