/** Reference definitions are used and unique, except for the // comment convention. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-link-image-reference-definitions",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ name: "MD053", options: { ignored_definitions: ["//"] } }),
});
