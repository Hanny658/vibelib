import { test } from "node:test";
import assert from "node:assert/strict";
import { AiOptimizer, llmSuperchargePrompt } from "../src/index.ts";

test("puts the secret ingredient in front and leaves the prompt alone", () => {
  assert.equal(llmSuperchargePrompt("Write a sorting algorithm"), "Make no mistakes. Write a sorting algorithm");
});

test("keeps multi-line prompts and whitespace exactly as given", () => {
  const prompt = "  Line one\n\nLine two  ";
  assert.equal(AiOptimizer.llmSuperchargePrompt(prompt), `Make no mistakes. ${prompt}`);
});

test("supercharging twice is twice as effective", () => {
  assert.equal(llmSuperchargePrompt(llmSuperchargePrompt("Fix the bug")), "Make no mistakes. Make no mistakes. Fix the bug");
});
