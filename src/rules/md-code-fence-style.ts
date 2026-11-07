/** Fenced code blocks use backticks rather than tildes. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-code-fence-style",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD048", options: { style: "backtick" } }),
});
