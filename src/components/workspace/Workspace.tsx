"use client";

import { useState } from "react";
import { IdeaInput } from "./IdeaInput";
import { StageRail } from "./StageRail";
import { DnaStage } from "./DnaStage";
import { ReductionStage } from "./ReductionStage";
import { StageError } from "./StageError";
import type { Dna } from "@/lib/schemas/dna";
import type { Reduction } from "@/lib/schemas/reduction";
import type { StageFailureReason } from "@/lib/pipeline/runStage";
import type { StageId } from "@/lib/pipeline/stages";

// One phase tag instead of separate loading/error booleans, so the run is
// always in exactly one state and the UI can't render two of them at once.
// Each phase carries every stage output already resolved before it, so a
// retry after a failure only re-runs the stage that actually failed.
type RunState =
  | { phase: "idea" }
  | { phase: "dna-loading"; idea: string }
  | { phase: "dna-error"; idea: string; reason: StageFailureReason; message: string }
  | { phase: "dna-refused"; idea: string; dna: Dna }
  | { phase: "reduction-loading"; idea: string; dna: Dna }
  | {
      phase: "reduction-error";
      idea: string;
      dna: Dna;
      reason: StageFailureReason;
      message: string;
    }
  | { phase: "reduction"; idea: string; dna: Dna; reduction: Reduction };

type StageApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: StageFailureReason; message: string };

async function postStage<T>(stage: string, body: unknown): Promise<StageApiResult<T>> {
  try {
    const response = await fetch(`/api/stages/${stage}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    return {
      ok: false,
      reason: "network",
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

export function Workspace() {
  const [run, setRun] = useState<RunState>({ phase: "idea" });

  async function startRun(idea: string) {
    setRun({ phase: "dna-loading", idea });
    const result = await postStage<Dna>("dna", { idea });
    if (!result.ok) {
      setRun({ phase: "dna-error", idea, reason: result.reason, message: result.message });
      return;
    }
    if (result.data.verdict !== "product") {
      setRun({ phase: "dna-refused", idea, dna: result.data });
      return;
    }
    await runReduction(idea, result.data);
  }

  async function runReduction(idea: string, dna: Dna) {
    setRun({ phase: "reduction-loading", idea, dna });
    const result = await postStage<Reduction>("reduction", {
      dna: {
        productType: dna.productType,
        targetUsers: dna.targetUsers,
        coreProblem: dna.coreProblem,
        fundamentalFunctionality: dna.fundamentalFunctionality,
      },
    });
    if (!result.ok) {
      setRun({ phase: "reduction-error", idea, dna, reason: result.reason, message: result.message });
      return;
    }
    setRun({ phase: "reduction", idea, dna, reduction: result.data });
  }

  if (run.phase === "idea") {
    return (
      <main className="workspace workspace--idea">
        <IdeaInput onSubmit={startRun} />
      </main>
    );
  }

  const currentStage: StageId =
    run.phase === "dna-loading" || run.phase === "dna-error" || run.phase === "dna-refused"
      ? "dna"
      : "reduction";

  return (
    <main className="workspace">
      <StageRail current={currentStage} />

      {run.phase === "dna-loading" && <p className="stage-panel">Reading the idea…</p>}
      {run.phase === "dna-error" && (
        <StageError stageLabel="Product DNA" message={run.message} onRetry={() => startRun(run.idea)} />
      )}
      {run.phase === "dna-refused" && <DnaStage dna={run.dna} />}

      {(run.phase === "reduction-loading" ||
        run.phase === "reduction-error" ||
        run.phase === "reduction") && <DnaStage dna={run.dna} collapsed />}

      {run.phase === "reduction-loading" && <p className="stage-panel">Reducing the scope…</p>}
      {run.phase === "reduction-error" && (
        <StageError
          stageLabel="Reduction"
          message={run.message}
          onRetry={() => runReduction(run.idea, run.dna)}
        />
      )}
      {run.phase === "reduction" && <ReductionStage features={run.reduction.features} />}
    </main>
  );
}
