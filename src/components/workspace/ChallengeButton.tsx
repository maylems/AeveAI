import { useState } from "react";

type ChallengeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; explanation: string }
  | { status: "error"; message: string };

export function ChallengeButton({
  feature,
}: {
  feature: { name: string; description: string; reason: string };
}) {
  const [state, setState] = useState<ChallengeState>({ status: "idle" });

  async function challenge() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/stages/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature }),
      });
      const result = await response.json();
      if (result.ok) {
        setState({ status: "done", explanation: result.data.explanation });
      } else {
        setState({ status: "error", message: result.message });
      }
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  if (state.status === "done") {
    return <p className="challenge-explanation">{state.explanation}</p>;
  }

  return (
    <div className="challenge">
      <button type="button" onClick={challenge} disabled={state.status === "loading"}>
        {state.status === "loading" ? "Thinking…" : "Challenge this decision"}
      </button>
      {state.status === "error" && <p className="challenge-error">{state.message}</p>}
    </div>
  );
}
