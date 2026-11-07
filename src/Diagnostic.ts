export interface Diagnostic {
  /** Project-relative path, with forward slashes. Locations are one-based. */
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly tool: string;
  /** Null for tool diagnostics, such as parser errors. */
  readonly rule: string | null;
  readonly message: string;
}

export interface LintResult {
  readonly files: number;
  readonly diagnostics: readonly Diagnostic[];
}
