import { extname } from "node:path";

const languages = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".mts": "ts",
  ".cts": "ts",
  ".tsx": "tsx",
  ".md": "md",
  ".markdown": "md",
  ".mdx": "mdx",
  ".json": "json",
  ".jsonc": "jsonc",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".css": "css",
  ".html": "html",
  ".sh": "sh",
  ".txt": "text",
} as const;

export type Language = (typeof languages)[keyof typeof languages];

const languageByExtension: Readonly<Record<string, Language | undefined>> = languages;

export interface File {
  /** Project-relative path, with forward slashes. */
  readonly path: string;
  readonly extension: string;
  /** Undefined when the extension is not recognized. */
  readonly language: Language | undefined;
}

export const make = (path: string): File => {
  const extension = extname(path).toLowerCase();
  return { path, extension, language: languageByExtension[extension] };
};
