/** Tables are separated from surrounding content by blank lines. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-blanks-around-tables",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD058" }),
});
