/** Headings have a blank line on both sides, including after frontmatter. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-blanks-around-headings",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({
    name: "MD022",
    options: { lines_above: 1, lines_below: 1, include_front_matter: true },
  }),
});
