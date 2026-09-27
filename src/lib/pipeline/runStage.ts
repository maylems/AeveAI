import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, MODEL } from "@/lib/openai";

export type StageFailureReason = "refusal" | "truncated" | "invalid" | "network";

export type StageResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: StageFailureReason; message: string };

// The single choke point for every model call: live call, then refusal check,
// then truncation check, then the Zod parse the SDK already ran for us via
// zodTextFormat. Every stage (dna, reduction, plan, challenge) goes through
// this, so a schema/prompt pair is all a new stage needs to add.
export async function runStage<T>(
  schema: z.ZodType<T>,
  schemaName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<StageResult<T>> {
  const client = getOpenAIClient();

  let response;
  try {
    response = await client.responses.parse({
      model: MODEL,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: { format: zodTextFormat(schema, schemaName) },
    });
  } catch (error) {
    return {
      ok: false,
      reason: "network",
      message: error instanceof Error ? error.message : "The request to OpenAI failed.",
    };
  }

  if (response.status === "incomplete") {
    return {
      ok: false,
      reason: "truncated",
      message: `Generation stopped early (${response.incomplete_details?.reason ?? "unknown reason"}).`,
    };
  }

  const message = response.output.find((item) => item.type === "message");
  const refusal = message?.content.find((part) => part.type === "refusal");
  if (refusal && refusal.type === "refusal") {
    return { ok: false, reason: "refusal", message: refusal.refusal };
  }

  if (!response.output_parsed) {
    return {
      ok: false,
      reason: "invalid",
      message: "The model's response didn't match the expected shape.",
    };
  }

  return { ok: true, data: response.output_parsed };
}
