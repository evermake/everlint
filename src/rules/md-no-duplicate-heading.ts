/** Sibling headings have unique text; different parents may reuse subsection names. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-duplicate-heading",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD024", options: { siblings_only: true } }),
});
