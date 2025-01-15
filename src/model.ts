import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
export const perplexity = createOpenAICompatible({
  name: "perplexity",
  apiKey: Deno.env.get("PERPLEXITY_API_KEY"),
  baseURL: "https://api.perplexity.ai/",
});

const anthropic = createAnthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const openai = createOpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const deepseek = createDeepSeek({
  apiKey: Deno.env.get("DEEPSEEK_API_KEY"),
});

const google = createGoogleGenerativeAI({
  apiKey: Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY"),
});

// ----- Model selection -----

// Perplexity API - Available models see the list here https://docs.perplexity.ai/guides/model-cards
// Required to put the PERPLEXITY_API_KEY in the .env file
const perplexitySmall = perplexity("llama-3.1-sonar-small-128k-online");
const perplexityLarge = perplexity("llama-3.1-sonar-large-128k-online");
const perplexityHuge = perplexity("llama-3.1-sonar-huge-128k-online");

// Anthropic API - Available models see the list here https://docs.anthropic.com/en/docs/reference/api/models
// Required to put the ANTHROPIC_API_KEY in the .env file
const anthropicClaude35Sonnet = anthropic("claude-3-5-sonnet-latest");
const anthropicClaude35Haiku = anthropic("claude-3-5-haiku-latest");

// OpenAI API - Available models see the list here https://platform.openai.com/docs/models
// Required to put the OPENAI_API_KEY in the .env file
const openaiGPT4o = openai("gpt-4o");
const openaiGPT4oMini = openai("gpt-4o-mini");
const openaiGPTo1Mini = openai("gpt-o1-mini");

// DeepSeek API - Available models see the list here
const deepseekChat = deepseek("deepseek-chat");

// Google Generative AI API - Available models see the list here
const googleGenerativeAI = google("gemini-1.5-flash-latest");

// Replace this with the model you want to use
export const model = googleGenerativeAI;
