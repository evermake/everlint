/** Code blocks use fences rather than indentation alone. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-code-block-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD046", options: { style: "fenced" } }),
});
