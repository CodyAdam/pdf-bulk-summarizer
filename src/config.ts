import "jsr:@std/dotenv/load";

if (!Deno.env.get("PROMPT_USED")) {
  throw new Error("PROMPT_USED is not set in .env file");
}

const promptUsed = Deno.env.get("PROMPT_USED");
const promptBasePath = "./prompts/";
const rawJsonPrompt = await Deno.readTextFile(promptBasePath + promptUsed);


import { z } from "zod";

const promptSchema = z.object({
  systemPrompt: z.string(),
  prefixForEach: z.string(),
  prompts: z.array(z.object({
    name: z.string(),
    prompt: z.string()
  })),
  suffixForEach: z.string()
});

export const promptConfig = promptSchema.parse(JSON.parse(rawJsonPrompt));
