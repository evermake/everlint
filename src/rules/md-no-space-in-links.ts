/** Link text has no leading or trailing whitespace. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-space-in-links",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD039" }),
});
