/** Markdown prose should use spaces instead of hard tabs. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-hard-tabs",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD010", options: { code_blocks: false } }),
});
