/** Table pipes align vertically with the header row. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-table-column-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD060", options: { style: "aligned" } }),
});
