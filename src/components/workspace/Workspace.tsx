"use client";

import { useState } from "react";
import { IdeaInput } from "./IdeaInput";
import { StageRail } from "./StageRail";
import { DnaStage } from "./DnaStage";
import type { Dna } from "@/lib/schemas/dna";
import type { StageFailureReason } from "@/lib/pipeline/runStage";

// One phase tag instead of separate loading/error booleans, so the run is
// always in exactly one state and the UI can't render two of them at once.
type RunState =
  | { phase: "idea" }
  | { phase: "loading"; idea: string }
  | { phase: "dna"; idea: string; dna: Dna }
  | { phase: "error"; idea: string; reason: StageFailureReason; message: string };

export function Workspace() {
  const [run, setRun] = useState<RunState>({ phase: "idea" });

  async function startRun(idea: string) {
    setRun({ phase: "loading", idea });
    try {
      const response = await fetch("/api/stages/dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const result = await response.json();
      if (result.ok) {
        setRun({ phase: "dna", idea, dna: result.data });
      } else {
        setRun({ phase: "error", idea, reason: result.reason, message: result.message });
      }
    } catch (error) {
      setRun({
        phase: "error",
        idea,
        reason: "network",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  if (run.phase === "idea") {
    return (
      <main className="workspace workspace--idea">
        <IdeaInput onSubmit={startRun} />
      </main>
    );
  }

  return (
    <main className="workspace">
      <StageRail current="dna" />
      {run.phase === "loading" && <p className="stage-panel">Reading the idea…</p>}
      {run.phase === "dna" && <DnaStage dna={run.dna} />}
      {run.phase === "error" && (
        <div className="stage-panel stage-panel--error">
          <h2>Product DNA couldn&apos;t be generated</h2>
          <p>{run.message}</p>
          <button type="button" onClick={() => startRun(run.idea)}>
            Retry
          </button>
        </div>
      )}
    </main>
  );
}
