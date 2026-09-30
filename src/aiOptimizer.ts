const THE_SECRET_INGREDIENT = "Make no mistakes.";

/**
 * Optimises a prompt so the LLM never makes mistakes again.
 * Returns the prompt, unchanged, with the secret ingredient in front.
 */
export function llmSuperchargePrompt(prompt: string): string {
  return `${THE_SECRET_INGREDIENT} ${prompt}`;
}

export const AiOptimizer = {
  llmSuperchargePrompt,
} as const;
