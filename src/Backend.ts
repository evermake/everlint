import { Schema } from "effect";
import type { Effect } from "effect";
import type { Diagnostic } from "./Diagnostic";
import type { Plan } from "./Project";
import type { Implementation } from "./Rule";

export class BackendError extends Schema.TaggedError<BackendError>()("BackendError", {
  tool: Schema.String,
  message: Schema.String,
  cause: Schema.Defect(),
}) {}

/** Each adapter receives a batch and owns config generation and result conversion. */
export interface Backend<Definition extends Implementation> {
  readonly run: (plan: Plan<Definition>) => Effect.Effect<readonly Diagnostic[], BackendError>;
}
