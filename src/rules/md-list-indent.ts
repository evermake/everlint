/** Sibling list items use consistent indentation. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-list-indent",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD005" }),
});
