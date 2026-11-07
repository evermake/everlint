/** Markdown lines have no trailing whitespace, including code blocks and blank list lines. */
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

export default Rule.make({
  id: "md-no-trailing-spaces",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({
    name: "MD009",
    options: { br_spaces: 0, code_blocks: true, list_item_empty_lines: false, strict: true },
  }),
});
