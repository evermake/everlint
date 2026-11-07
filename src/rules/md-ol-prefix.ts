/** Ordered-list source markers increase sequentially. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-ol-prefix",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD029", options: { style: "ordered" } }),
});
