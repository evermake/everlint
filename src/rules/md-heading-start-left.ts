/** Headings have no unnecessary indentation within their Markdown container. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-heading-start-left",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD023" }),
});
