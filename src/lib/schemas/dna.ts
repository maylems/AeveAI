import { z } from "zod";

// Every field is required (OpenAI strict mode forbids optional keys); the four
// DNA fields are nullable instead, so the model can omit them honestly when
// verdict isn't "product" without ever leaving them "made up".
export const DnaSchema = z.object({
  verdict: z.enum(["product", "notAProduct", "tooVague"]),
  response: z.string().nullable(),
  productType: z.string().nullable(),
  targetUsers: z.string().nullable(),
  coreProblem: z.string().nullable(),
  fundamentalFunctionality: z.string().nullable(),
});

export type Dna = z.infer<typeof DnaSchema>;
