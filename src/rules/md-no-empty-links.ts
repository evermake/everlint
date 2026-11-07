/** Links have nonempty destinations and do not use a bare hash placeholder. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-empty-links",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD042" }),
});
