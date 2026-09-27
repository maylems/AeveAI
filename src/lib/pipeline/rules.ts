import type { Reduction } from "@/lib/schemas/reduction";

export type RuleResult = { ok: true } | { ok: false; message: string };

// Structural checks a JSON Schema can't express: strict structured-output mode
// rejects constraints like "at least one item" or "this string is non-empty",
// so those business rules live here instead of in the Zod shape.
export function validateReduction(reduction: Reduction): RuleResult {
  const core = reduction.features.filter((feature) => feature.status === "core");
  const leftOut = reduction.features.filter((feature) => feature.status === "leftOut");

  if (core.length === 0) {
    return { ok: false, message: "No features survived the reduction." };
  }

  const missingReason = leftOut.find(
    (feature) => !feature.reason || feature.reason.trim().length === 0
  );
  if (missingReason) {
    return {
      ok: false,
      message: `"${missingReason.name}" was left out without a stated reason.`,
    };
  }

  return { ok: true };
}
