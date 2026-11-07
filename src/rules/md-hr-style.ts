/** Horizontal rules use exactly three dashes. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-hr-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD035", options: { style: "---" } }),
});
