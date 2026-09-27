import { NextRequest, NextResponse } from "next/server";
import { DnaSchema } from "@/lib/schemas/dna";
import { DNA_SYSTEM_PROMPT, dnaUserPrompt } from "@/lib/pipeline/prompts";
import { runStage } from "@/lib/pipeline/runStage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stage: string }> }
) {
  const { stage } = await params;

  if (stage === "dna") {
    const body = await request.json();
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";
    if (!idea) {
      return NextResponse.json(
        { ok: false, reason: "invalid", message: "An idea is required." },
        { status: 400 }
      );
    }
    const result = await runStage(DnaSchema, DNA_SYSTEM_PROMPT, dnaUserPrompt(idea));
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { ok: false, reason: "invalid", message: `Unknown stage "${stage}".` },
    { status: 404 }
  );
}
