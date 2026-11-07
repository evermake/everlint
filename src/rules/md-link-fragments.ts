/** Same-document fragments match GitHub-style heading anchors or explicit IDs exactly. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-link-fragments",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD051", options: { ignore_case: false, ignored_pattern: "" } }),
});
