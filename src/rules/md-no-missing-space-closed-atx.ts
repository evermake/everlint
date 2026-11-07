/** Closed-looking ATX headings have spaces inside both hash sequences. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-missing-space-closed-atx",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD020" }),
});
