import { NextRequest, NextResponse } from "next/server";
import { DnaSchema } from "@/lib/schemas/dna";
import { ReductionSchema } from "@/lib/schemas/reduction";
import { ChallengeSchema } from "@/lib/schemas/challenge";
import {
  DNA_SYSTEM_PROMPT,
  dnaUserPrompt,
  REDUCTION_SYSTEM_PROMPT,
  reductionUserPrompt,
  CHALLENGE_SYSTEM_PROMPT,
  challengeUserPrompt,
} from "@/lib/pipeline/prompts";
import { runStage } from "@/lib/pipeline/runStage";
import { validateReduction } from "@/lib/pipeline/rules";

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

  if (stage === "reduction") {
    const body = await request.json();
    const dna = body.dna;
    if (!dna || typeof dna.productType !== "string") {
      return NextResponse.json(
        { ok: false, reason: "invalid", message: "Product DNA is required." },
        { status: 400 }
      );
    }
    const result = await runStage(
      ReductionSchema,
      REDUCTION_SYSTEM_PROMPT,
      reductionUserPrompt(dna),
      4096
    );
    if (!result.ok) {
      return NextResponse.json(result);
    }
    const rule = validateReduction(result.data);
    if (!rule.ok) {
      return NextResponse.json({ ok: false, reason: "invalid", message: rule.message });
    }
    return NextResponse.json(result);
  }

  if (stage === "challenge") {
    const body = await request.json();
    const feature = body.feature;
    if (!feature || typeof feature.name !== "string") {
      return NextResponse.json(
        { ok: false, reason: "invalid", message: "A feature is required." },
        { status: 400 }
      );
    }
    const result = await runStage(
      ChallengeSchema,
      CHALLENGE_SYSTEM_PROMPT,
      challengeUserPrompt(feature),
      2048
    );
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { ok: false, reason: "invalid", message: `Unknown stage "${stage}".` },
    { status: 404 }
  );
}
