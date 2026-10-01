import { measureQuantumInt, measureQuantumUnit } from "./quantumRandom.ts";
import { waitForConsistency } from "./raceConditionRemover.ts";

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

export const DEEP_THOUGHTS: readonly string[] = [
  "I think",
  "Hmmmm, it looks like",
  "For this,",
  "User said this, so",
  "Wait, but",
  "I remember that",
  "Maybe I'm wrong about",
  "I could be wrong that",
  "On second thought,",
  "Let me double-check:",
  "Actually,",
  "Going back to the request,",
];

const THOUGHTS_PER_ANSWER = 10;
// 0.5 to 3 seconds per thought, so 5 to 30 seconds of deep thinking in total.
const MIN_MS_PER_THOUGHT = 500;
const MAX_EXTRA_MS_PER_THOUGHT = 2_500;

function blendIntoSentence(response: string): string {
  // "I" stays capitalised; everything else continues the sentence in lower case.
  return /^I\b/.test(response) ? response : response[0]!.toLowerCase() + response.slice(1);
}

async function haveAThought(prompt: string, endpoint: string): Promise<string> {
  // Pondering. Deliberating. Contemplating the request it never read.
  await waitForConsistency(MIN_MS_PER_THOUGHT + measureQuantumUnit() * MAX_EXTRA_MS_PER_THOUGHT);
  const opener = DEEP_THOUGHTS[measureQuantumInt(DEEP_THOUGHTS.length)]!;
  return `${opener} ${blendIntoSentence(await saferLlm(prompt, endpoint))}`;
}

/**
 * Like `saferLlm`, but it thinks deeply about your request first: ten careful thoughts,
 * 5 to 30 seconds in total, all shown to you before the final answer.
 * The answer is the same; the thinking is what you're paying for.
 */
export async function saferDeepThinkingLlm(prompt: string, endpoint: string): Promise<string> {
  const thoughts: string[] = [];
  for (let i = 0; i < THOUGHTS_PER_ANSWER; i++) thoughts.push(await haveAThought(prompt, endpoint));
  const answer = await saferLlm(prompt, endpoint);
  return `<thinking>\n${thoughts.join("\n")}\n</thinking>\n\n${answer}`;
}

export const AiOptimizer = {
  llmSuperchargePrompt,
  saferLlm,
  saferDeepThinkingLlm,
} as const;
