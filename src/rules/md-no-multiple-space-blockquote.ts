/** Blockquote markers have no extra following spaces, including in list items. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-multiple-space-blockquote",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD027", options: { list_items: true } }),
});
