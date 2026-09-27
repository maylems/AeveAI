import { z } from "zod";

export const ChallengeSchema = z.object({
  explanation: z.string(),
});

export type Challenge = z.infer<typeof ChallengeSchema>;
