/** Images provide alternate text or explicitly hide decorative HTML images. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-require-alt-text",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD045" }),
});
