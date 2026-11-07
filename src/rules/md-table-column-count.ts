/** Every table row has the same number of cells as its header. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-table-column-count",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD056" }),
});
