/** Table rows include both leading and trailing pipes. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-table-pipe-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD055", options: { style: "leading_and_trailing" } }),
});
