export const STAGES = ["idea", "dna", "reduction", "mvp", "plan", "build"] as const;
export type StageId = (typeof STAGES)[number];

export const STAGE_LABELS: Record<StageId, string> = {
  idea: "Idea",
  dna: "Product DNA",
  reduction: "Reduction",
  mvp: "MVP",
  plan: "Technical Plan",
  build: "Build",
};
