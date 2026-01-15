import { z } from "zod";
const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
});
export const env = EnvSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
});

