/** ATX heading text is separated from its opening hashes by a space. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-missing-space-atx",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD018" }),
});
