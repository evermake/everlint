/** Fenced code blocks have surrounding blank lines, including within list items. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-blanks-around-fences",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD031", options: { list_items: true } }),
});
