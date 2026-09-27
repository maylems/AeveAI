import Anthropic from "@anthropic-ai/sdk";

// Verified against platform.claude.com/docs/about-claude/models/overview on
// 2026-09-27: claude-sonnet-5 supports Structured Outputs and is "the best
// combination of speed and intelligence" at $2/$10 per MTok — not the cheapest
// tier, not the flagship. Re-check Reduction-stage reasoning quality on the
// first real run per spec.md > Stack; escalate to claude-opus-5-5 if it isn't
// specific enough.
export const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example)."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}
