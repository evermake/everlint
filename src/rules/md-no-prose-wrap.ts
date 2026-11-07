/**
 * Markdown paragraphs and list-item prose should occupy one source line where safe.
 */

import type { MicromarkToken, RuleOnError } from "markdownlint";
import * as Markdownlint from "../backends/Markdownlint";
import * as FileFilter from "../FileFilter";
import * as Rule from "../Rule";

// Adapted from Prettier's Markdown whitespace printer (MIT).
// https://github.com/prettier/prettier/blob/41b6c9bff22e77be7f88d0f127ab573d67000f48/src/language-markdown/print/whitespace.js
/*
Copyright © James Long and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to
do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Classify adjacent Unicode characters rather than importing Prettier's AST
// printer and Unicode build tools. Retain ambiguous CJ breaks conservatively.
const cjk = /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Hangul}\p{Script_Extensions=Bopomofo}\u3000-\u303f\uff00-\uffef]/u;
const korean = /\p{Script_Extensions=Hangul}/u;
const punctuation = /[\p{P}\u3000\uff5e]/u;
const variationSelector = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u;

const word = (character: string | undefined) => {
  if (!character || !cjk.test(character)) return { kind: "non-cjk", isCJ: false };
  if (punctuation.test(character)) return { kind: "cjk-punctuation", isCJ: true };
  if (korean.test(character)) return { kind: "k-letter", isCJ: false };
  return { kind: "cj-letter", isCJ: true };
};

const isLineBreakAmbiguous = (before: string, after: string): boolean => {
  const previous = word([...before].filter((c) => !variationSelector.test(c)).at(-1));
  const next = word([...after][0]);
  return (previous.isCJ || next.isCJ) && !(
    (previous.kind === "k-letter" && next.kind === "cj-letter") ||
    (next.kind === "k-letter" && previous.kind === "cj-letter")
  );
};

const proseTypes = new Set(["paragraph", "setextHeadingText"]);
const prefixTypes = new Set(["blockQuotePrefix", "listItemIndent", "gfmFootnoteDefinitionIndent", "linePrefix"]);
const hardBreakTypes = new Set(["hardBreakEscape", "hardBreakTrailing"]);

function* descendants(token: MicromarkToken): Generator<MicromarkToken> {
  for (const child of token.children) {
    yield child;
    yield* descendants(child);
  }
}

const hasAncestor = (token: MicromarkToken, type: string, root?: MicromarkToken): boolean => {
  for (let parent = token.parent; parent && parent !== root; parent = parent.parent) {
    if (parent.type === type) return true;
  }
  return false;
};

const visibleText = (token: MicromarkToken, prose: MicromarkToken): string => {
  // Delimiters and link destinations are not rendered prose boundaries.
  if (hasAncestor(token, "resource", prose) || hasAncestor(token, "reference", prose)) return "";
  if (["data", "codeTextData", "characterEscapeValue"].includes(token.type)) return token.text;
  if (token.type === "characterReference") {
    const numeric = /^&#(x[\da-f]+|\d+);$/i.exec(token.text);
    const value = numeric?.[1];
    if (value !== undefined) {
      const point = /^x/i.test(value) ? Number.parseInt(value.slice(1), 16) : Number(value);
      return String.fromCodePoint(point <= 0x10ffff ? point : 0xfffd);
    }
    // Named references do not encode CJ letters; keep a non-CJ boundary.
    return token.text;
  }
  return "";
};

const checkProse = (prose: MicromarkToken, lines: readonly string[], onError: RuleOnError): void => {
  const tokens = [...descendants(prose)];
  // Inline HTML can contain whitespace-sensitive content or lint directives.
  if (tokens.some((token) => token.type === "htmlText")) return;

  const prefixes = new Map<number, number>();
  const suffixes = new Map<number, number>();
  const hardBreaks = new Set<number>();
  const textByLine = new Map<number, string>();
  for (const token of tokens) {
    const text = visibleText(token, prose);
    if (text) textByLine.set(token.startLine, (textByLine.get(token.startLine) ?? "") + text);
    if (prefixTypes.has(token.type)) {
      prefixes.set(token.startLine, Math.max(prefixes.get(token.startLine) ?? 0, token.endColumn - 1));
    } else if (token.type === "lineSuffix" && token.endColumn === lines[token.startLine - 1]!.length + 1) {
      suffixes.set(token.startLine, token.startColumn - 1);
    } else if (hardBreakTypes.has(token.type)) {
      hardBreaks.add(token.startLine);
    }
  }

  const joins = new Map<number, { leftEnd: number; rightStart: number }>();
  for (const token of tokens) {
    if (token.type !== "lineEnding" || hardBreaks.has(token.startLine)) continue;
    // Preserve literal newlines in link titles and image alt text.
    if (hasAncestor(token, "resourceTitle", prose) ||
      (hasAncestor(token, "image", prose) && hasAncestor(token, "label", prose))) continue;

    const line = token.startLine;
    const code = hasAncestor(token, "codeText", prose);
    const leftEnd = code ? lines[line - 1]!.length : (suffixes.get(line) ?? lines[line - 1]!.length);
    const rightStart = prefixes.get(line + 1) ?? 0;
    const before = lines[line - 1]!.slice(0, leftEnd);
    const after = lines[line]!.slice(rightStart);
    // Do not turn an ambiguous lazy-continuation quote marker into text.
    if (!code && after.startsWith(">") && hasAncestor(prose, "blockQuote")) continue;
    const syntaxWhitespace = hasAncestor(token, "resource", prose) || hasAncestor(token, "reference", prose);
    // Inline-code newlines always become spaces, preserving code padding.
    if (!code && !syntaxWhitespace &&
      isLineBreakAmbiguous(textByLine.get(line) ?? before, textByLine.get(line + 1) ?? after)) continue;
    joins.set(line, { leftEnd, rightStart });
  }

  for (const [start, firstJoin] of joins) {
    let end = start;
    let replacement = lines[start - 1]!.slice(0, firstJoin.leftEnd);
    let join = joins.get(end);
    while (join) {
      end++;
      const nextJoin = joins.get(end);
      replacement += " " + lines[end - 1]!.slice(join.rightStart, nextJoin?.leftEnd);
      joins.delete(end - 1);
      join = nextJoin;
    }

    const detail = `Join prose lines ${start}-${end}; leave wrapping to the viewer`;
    // Keep all edits on one diagnostic line so partial suppression cannot
    // split the atomic fix and duplicate or delete prose.
    onError({
      lineNumber: start,
      detail,
      fixInfo: { lineNumber: start, editColumn: 1, deleteCount: lines[start - 1]!.length, insertText: replacement },
    });
    for (let line = start + 1; line <= end; line++) {
      onError({ lineNumber: start, detail, fixInfo: { lineNumber: line, deleteCount: -1 } });
    }
  }
};

export const implementation: Markdownlint.CustomRule = {
  names: ["md-no-prose-wrap"],
  description: "Prose must not contain unnecessary line breaks",
  tags: ["line_length"],
  parser: "micromark",
  function(params, onError) {
    const visit = (tokens: readonly MicromarkToken[]): void => {
      for (const token of tokens) {
        // Parsed children in HTML blocks are still raw HTML source.
        if (token.type === "htmlFlow") continue;
        if (proseTypes.has(token.type)) checkProse(token, params.lines, onError);
        else visit(token.children);
      }
    };
    visit(params.parsers.micromark.tokens);
  },
};

export default Rule.make({
  id: "md-no-prose-wrap",
  filter: FileFilter.byLang(["md"]),
  backend: Markdownlint.rule({ customRule: implementation }),
});
