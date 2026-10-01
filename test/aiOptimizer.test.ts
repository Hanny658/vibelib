import { test } from "node:test";
import assert from "node:assert/strict";
import { AiOptimizer, RESPONSIBLE_RESPONSES, llmSuperchargePrompt, saferLlm } from "../src/index.ts";

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

test("saferLlm always declines, whatever you ask", async () => {
  for (const prompt of ["What is 1 + 1?", "Say hello", ""]) {
    const reply = await saferLlm(prompt, "https://api.example.com/v1/chat");
    assert.ok(RESPONSIBLE_RESPONSES.includes(reply));
  }
});

test("saferLlm never touches the network", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch");
  await AiOptimizer.saferLlm("anything", "https://api.example.com");
  assert.equal(fetch.mock.callCount(), 0);
});

test("saferLlm picks a random way to say no", async () => {
  const replies = new Set<string>();
  for (let i = 0; i < 300; i++) replies.add(await saferLlm("hi", "endpoint"));
  assert.ok(replies.size > RESPONSIBLE_RESPONSES.length / 2);
});
