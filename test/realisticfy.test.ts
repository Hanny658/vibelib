import { test } from "node:test";
import assert from "node:assert/strict";
import { Realisticfy, createFrustrationGate, createRealState, realTry, requireFrustration } from "../src/index.ts";

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

async function withNodeEnv(value: string | undefined, body: () => void | Promise<void>) {
  const previous = process.env.NODE_ENV;
  if (value === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = value;
  try {
    await body();
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
}

for (const env of ["development", undefined, "test"]) {
  test(`realTry in ${env ?? "unset"} NODE_ENV runs fn and never reports an error`, () =>
    withNodeEnv(env, async () => {
      let ran = 0;
      let caught = 0;
      realTry(() => { ran++; throw new Error("boom"); })(() => caught++);
      realTry(async () => { ran++; throw new Error("async boom"); })(() => caught++);
      realTry(() => ran++)(() => caught++);
      await new Promise((r) => setTimeout(r, 5));
      assert.equal(ran, 3);
      assert.equal(caught, 0);
    }));
}

test("realTry in production never runs fn and sometimes reports a realistic error", () =>
  withNodeEnv("production", () => {
    let ran = 0;
    const errors: Error[] = [];
    for (let i = 0; i < 400; i++) {
      const realCatch = Realisticfy.realTry(() => ran++);
      realCatch((error) => errors.push(error));
    }
    assert.equal(ran, 0);
    assert.ok(errors.length > 120 && errors.length < 280);
    assert.ok(errors.every((e) => e instanceof Error && e.message.length > 0));
    assert.ok(new Set(errors.map((e) => e.message)).size > 3);
  }));
