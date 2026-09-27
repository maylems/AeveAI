import type { Feature } from "@/lib/schemas/reduction";
import { ChallengeButton } from "./ChallengeButton";

export function ReductionStage({ features }: { features: Feature[] }) {
  const core = features.filter((feature) => feature.status === "core");
  const leftOut = features.filter((feature) => feature.status === "leftOut");

  return (
    <div className="stage-panel">
      <h2>Reduction</h2>

      <h3 className="reduction-heading reduction-heading--core">Core MVP</h3>
      <ul className="reduction-list reduction-list--core">
        {core.map((feature) => (
          <li key={feature.name}>
            <p className="reduction-feature-name">{feature.name}</p>
            <p className="reduction-feature-description">{feature.description}</p>
          </li>
        ))}
      </ul>

      <h3 className="reduction-heading reduction-heading--left-out">Left Out</h3>
      <ul className="reduction-list reduction-list--left-out">
        {leftOut.map((feature) => (
          <li key={feature.name}>
            <p className="reduction-feature-name">{feature.name}</p>
            <p className="reduction-feature-reason">{feature.reason}</p>
            {feature.reason && (
              <ChallengeButton
                feature={{
                  name: feature.name,
                  description: feature.description,
                  reason: feature.reason,
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
