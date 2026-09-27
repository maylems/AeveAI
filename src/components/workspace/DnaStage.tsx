import type { Dna } from "@/lib/schemas/dna";

export function DnaStage({ dna, collapsed = false }: { dna: Dna; collapsed?: boolean }) {
  if (dna.verdict !== "product") {
    return (
      <div className="stage-panel">
        <h2>Product DNA</h2>
        <p>{dna.response}</p>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="stage-panel stage-panel--collapsed">
        <h3>Product DNA</h3>
        <p className="mono">{dna.productType}</p>
      </div>
    );
  }

  return (
    <div className="stage-panel">
      <h2>Product DNA</h2>
      <dl className="dna-fields mono">
        <dt>Product type</dt>
        <dd>{dna.productType}</dd>
        <dt>Target users</dt>
        <dd>{dna.targetUsers}</dd>
        <dt>Core problem</dt>
        <dd>{dna.coreProblem}</dd>
        <dt>Fundamental functionality</dt>
        <dd>{dna.fundamentalFunctionality}</dd>
      </dl>
    </div>
  );
}
