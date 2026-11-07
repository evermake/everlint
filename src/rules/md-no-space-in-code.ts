/** Inline code has no unnecessary boundary whitespace, preserving valid padding. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-space-in-code",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD038" }),
});
