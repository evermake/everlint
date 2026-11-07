/** Heading levels must not skip nesting levels; a frontmatter title counts as H1. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-heading-increment",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({
    name: "MD001",
    options: { front_matter_title: "^\\s*title\\s*[:=]" },
  }),
});
