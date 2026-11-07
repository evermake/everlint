/** Lists are separated from surrounding content by blank lines. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-blanks-around-lists",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD032" }),
});
