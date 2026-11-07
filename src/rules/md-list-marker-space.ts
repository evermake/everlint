/** Ordered and unordered list markers use one following space. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-list-marker-space",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({
    name: "MD030",
    options: { ol_multi: 1, ol_single: 1, ul_multi: 1, ul_single: 1 },
  }),
});
