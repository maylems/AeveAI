import { z } from "zod";

export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["core", "leftOut"]),
  // Required key, nullable value: null for "core" features, a specific
  // sentence for every "leftOut" one. Same pattern as dna.ts's verdict fields.
  reason: z.string().nullable(),
});

export const ReductionSchema = z.object({
  features: z.array(FeatureSchema),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type Reduction = z.infer<typeof ReductionSchema>;
