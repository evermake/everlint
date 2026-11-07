/** Markdown files end with a terminating newline. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-require-final-newline",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD047" }),
});
