/** ATX heading text uses only one space after the opening hashes. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-multiple-space-atx",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD019" }),
});
