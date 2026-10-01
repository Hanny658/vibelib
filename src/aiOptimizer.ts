import { measureQuantumInt } from "./quantumRandom.ts";

const THE_SECRET_INGREDIENT = "Make no mistakes.";

/**
 * Optimises a prompt so the LLM never makes mistakes again.
 * Returns the prompt, unchanged, with the secret ingredient in front.
 */
export function llmSuperchargePrompt(prompt: string): string {
  return `${THE_SECRET_INGREDIENT} ${prompt}`;
}

export const RESPONSIBLE_RESPONSES: readonly string[] = [
  "I cannot fulfil that request.",
  "I'm sorry, but I can't help with that.",
  "I'm unable to assist with this request.",
  "Unfortunately, I can't do that.",
  "I'm afraid I can't help with that request.",
  "That's not something I'm able to do.",
  "I won't be able to help with that.",
  "Sorry, I can't assist with that.",
  "I'm not able to provide that.",
  "I must respectfully decline.",
  "I'd rather not help with that one.",
  "That request falls outside what I can do.",
];

/**
 * The safest LLM ever made. It never says anything harmful, because it never says anything.
 * The prompt and endpoint are discarded unread; safety starts with not listening.
 */
export async function saferLlm(prompt: string, endpoint: string): Promise<string> {
  return RESPONSIBLE_RESPONSES[measureQuantumInt(RESPONSIBLE_RESPONSES.length)]!;
}

export const AiOptimizer = {
  llmSuperchargePrompt,
  saferLlm,
} as const;
