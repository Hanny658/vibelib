import { test } from "node:test";
import assert from "node:assert/strict";
import { Realisticfy, createFrustrationGate, createRealState, requireFrustration } from "../src/index.ts";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("the gate only opens on the Nth attempt, then starts over", () => {
  const gate = createFrustrationGate({ threshold: 3 });
  assert.deepEqual([gate.vent(), gate.vent(), gate.vent()], [false, false, true]);
  assert.equal(gate.level, 0);
  assert.deepEqual([gate.vent(), gate.vent(), gate.vent()], [false, false, true]);
});

test("a realistic threshold is somewhere between 3 and 8, and changes", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 500; i++) {
    const { threshold } = createFrustrationGate();
    assert.ok(threshold >= 3 && threshold <= 8);
    seen.add(threshold);
  }
  assert.equal(seen.size, 6);
});

test("calming down resets frustration", async () => {
  const gate = createFrustrationGate({ threshold: 2, calmDownAfterMs: 20 });
  assert.equal(gate.vent(), false);
  await wait(40);
  assert.equal(gate.vent(), false); // counts as the first attempt again
  assert.equal(gate.vent(), true);
});

test("rejects nonsense thresholds", () => {
  assert.throws(() => createFrustrationGate({ threshold: 0 }), RangeError);
  assert.throws(() => createFrustrationGate({ threshold: 2.5 }), RangeError);
});

test("requireFrustration ignores calls until the user has had enough", () => {
  const calls: string[] = [];
  const submit = requireFrustration((form: string) => (calls.push(form), "sent"), { threshold: 4 });
  const results = ["a", "b", "c", "d"].map((f) => submit(f));
  assert.deepEqual(results, [undefined, undefined, undefined, "sent"]);
  assert.deepEqual(calls, ["d"]);
});

test("createRealState applies only the attempt that breaks the user", () => {
  const state = Realisticfy.createRealState(0, { threshold: 3 });
  let notified = 0;
  const unsubscribe = state.subscribe(() => notified++);
  assert.equal(state.set(1), false);
  assert.equal(state.set(2), false);
  assert.equal(state.get(), 0);
  assert.equal(state.set((n) => n + 10), true);
  assert.equal(state.get(), 10);
  assert.equal(notified, 1);
  unsubscribe();
  for (let i = 0; i < 3; i++) state.set(99);
  assert.equal(state.get(), 99);
  assert.equal(notified, 1);
});

test("createRealState does not notify when the value doesn't change", () => {
  const state = createRealState("same", { threshold: 1 });
  let notified = 0;
  state.subscribe(() => notified++);
  state.set("same");
  assert.equal(notified, 0);
});
