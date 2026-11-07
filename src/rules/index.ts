import noDebugger from "./no-debugger";
import strictEquality from "./strict-equality";

/** Explicit imports keep the rule catalog available in the standalone executable. */
export const rules = [noDebugger, strictEquality] as const;
