import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";

export type StageFailureReason = "refusal" | "truncated" | "invalid" | "network";

export type StageResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: StageFailureReason; message: string };

// The single choke point for every model call: live call, then refusal check,
// then truncation check, then a Zod parse we run ourselves. We use
// `messages.create()` rather than the SDK's `messages.parse()` convenience,
// because `.parse()` throws when the text doesn't match the schema (which is
// exactly what happens on a refusal, a plain-text response) instead of
// returning null the way we want to handle it as data.
export async function runStage<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<StageResult<T>> {
  const client = getAnthropicClient();

  let message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      output_config: { format: zodOutputFormat(schema) },
    });
  } catch (error) {
    return {
      ok: false,
      reason: "network",
      message: error instanceof Error ? error.message : "The request to Claude failed.",
    };
  }

  const textBlock = message.content.find((block) => block.type === "text");

  if (message.stop_reason === "refusal") {
    return {
      ok: false,
      reason: "refusal",
      message: textBlock?.text ?? "Claude declined to respond.",
    };
  }

  if (message.stop_reason === "max_tokens" || message.stop_reason === "model_context_window_exceeded") {
    return {
      ok: false,
      reason: "truncated",
      message: `Generation stopped early (${message.stop_reason}).`,
    };
  }

  if (!textBlock) {
    return { ok: false, reason: "invalid", message: "The model didn't return a text response." };
  }

  let json: unknown;
  try {
    json = JSON.parse(textBlock.text);
  } catch {
    return { ok: false, reason: "invalid", message: "The model's response wasn't valid JSON." };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: "The model's response didn't match the expected shape.",
    };
  }

  return { ok: true, data: parsed.data };
}
