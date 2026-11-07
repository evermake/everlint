import noDebugger from "./no-debugger";
import mdBlanksAroundFences from "./md-blanks-around-fences";
import mdBlanksAroundHeadings from "./md-blanks-around-headings";
import mdBlanksAroundLists from "./md-blanks-around-lists";
import mdBlanksAroundTables from "./md-blanks-around-tables";
import mdCodeBlockStyle from "./md-code-block-style";
import mdCodeFenceStyle from "./md-code-fence-style";
import mdEmphasisStyle from "./md-emphasis-style";
import mdHeadingIncrement from "./md-heading-increment";
import mdHeadingStartLeft from "./md-heading-start-left";
import mdHeadingStyle from "./md-heading-style";
import mdHrStyle from "./md-hr-style";
import mdLinkFragments from "./md-link-fragments";
import mdLinkImageReferenceDefinitions from "./md-link-image-reference-definitions";
import mdListIndent from "./md-list-indent";
import mdListMarkerSpace from "./md-list-marker-space";
import mdNoBareUrls from "./md-no-bare-urls";
import mdNoBlanksBlockquote from "./md-no-blanks-blockquote";
import mdNoDuplicateHeading from "./md-no-duplicate-heading";
import mdNoEmptyLinks from "./md-no-empty-links";
import mdNoHardTabs from "./md-no-hard-tabs";
import mdNoMissingSpaceAtx from "./md-no-missing-space-atx";
import mdNoMissingSpaceClosedAtx from "./md-no-missing-space-closed-atx";
import mdNoMultipleBlanks from "./md-no-multiple-blanks";
import mdNoMultipleSpaceAtx from "./md-no-multiple-space-atx";
import mdNoMultipleSpaceBlockquote from "./md-no-multiple-space-blockquote";
import mdNoProseWrap from "./md-no-prose-wrap";
import mdNoSpaceInCode from "./md-no-space-in-code";
import mdNoSpaceInEmphasis from "./md-no-space-in-emphasis";
import mdNoSpaceInLinks from "./md-no-space-in-links";
import mdNoTrailingSpaces from "./md-no-trailing-spaces";
import mdOlPrefix from "./md-ol-prefix";
import mdReferenceLinksImages from "./md-reference-links-images";
import mdRequireAltText from "./md-require-alt-text";
import mdRequireFinalNewline from "./md-require-final-newline";
import mdStrongStyle from "./md-strong-style";
import mdTableColumnCount from "./md-table-column-count";
import mdTableColumnStyle from "./md-table-column-style";
import mdTablePipeStyle from "./md-table-pipe-style";
import mdUlIndent from "./md-ul-indent";
import mdUlStyle from "./md-ul-style";
import strictEquality from "./strict-equality";

/** Explicit imports keep the rule catalog available in the standalone executable. */
export const rules = [
  noDebugger,
  mdBlanksAroundFences,
  mdBlanksAroundHeadings,
  mdBlanksAroundLists,
  mdBlanksAroundTables,
  mdCodeBlockStyle,
  mdCodeFenceStyle,
  mdEmphasisStyle,
  mdHeadingIncrement,
  mdHeadingStartLeft,
  mdHeadingStyle,
  mdHrStyle,
  mdLinkFragments,
  mdLinkImageReferenceDefinitions,
  mdListIndent,
  mdListMarkerSpace,
  mdNoBareUrls,
  mdNoBlanksBlockquote,
  mdNoDuplicateHeading,
  mdNoEmptyLinks,
  mdNoHardTabs,
  mdNoMissingSpaceAtx,
  mdNoMissingSpaceClosedAtx,
  mdNoMultipleBlanks,
  mdNoMultipleSpaceAtx,
  mdNoMultipleSpaceBlockquote,
  mdNoProseWrap,
  mdNoSpaceInCode,
  mdNoSpaceInEmphasis,
  mdNoSpaceInLinks,
  mdNoTrailingSpaces,
  mdOlPrefix,
  mdReferenceLinksImages,
  mdRequireAltText,
  mdRequireFinalNewline,
  mdStrongStyle,
  mdTableColumnCount,
  mdTableColumnStyle,
  mdTablePipeStyle,
  mdUlIndent,
  mdUlStyle,
  strictEquality,
] as const;
