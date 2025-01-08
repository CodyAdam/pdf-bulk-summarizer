import "jsr:@std/dotenv/load";

if (!Deno.env.get("PROMPT_USED")) {
  throw new Error("PROMPT_USED is not set in .env file");
}

const promptUsed = Deno.env.get("PROMPT_USED");
const promptBasePath = "./prompts/";
export const prompt = await Deno.readTextFile(promptBasePath + promptUsed);
