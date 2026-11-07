/** URLs and email addresses use explicit link syntax rather than bare autolinks. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-bare-urls",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD034" }),
});
