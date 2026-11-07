/** Emphasis markers have no spaces immediately inside them. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-space-in-emphasis",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD037" }),
});
