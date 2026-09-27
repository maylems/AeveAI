import OpenAI from "openai";

// Verified against platform.openai.com/docs/models on 2026-09-27: gpt-6-sol is
// built for "complex coding and agentic workflows" and supports Structured
// Outputs at 1/5 the input/output cost of the flagship gpt-6-astra. Re-check
// Reduction-stage reasoning quality on the first real run per spec.md >
// Stack; bump to gpt-6-astra if it isn't specific enough.
export const MODEL = "gpt-6-sol";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to .env.local (see .env.example)."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}
