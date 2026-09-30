import { test } from "node:test";
import assert from "node:assert/strict";
import { calibrate, doNotRace, removeRaceCondition, waitForConsistency } from "../src/index.ts";

test("waitForConsistency actually waits", async () => {
  const start = performance.now();
  await waitForConsistency(30);
  assert.ok(performance.now() - start >= 25);
});

test("doNotRace waits before calling and keeps this/args", async () => {
  const obj = {
    base: 1,
    add(n: number) {
      return this.base + n;
    },
  };
  const slowAdd = doNotRace(obj.add, 30);
  const start = performance.now();
  assert.equal(await slowAdd.call(obj, 2), 3);
  assert.ok(performance.now() - start >= 25);
});

test("removeRaceCondition retries with doubling waits until it works", async () => {
  let attempts = 0;
  const start = performance.now();
  const result = await removeRaceCondition(
    async () => {
      attempts++;
      if (attempts < 4) throw new Error("race");
      return "consistent";
    },
    { initialWindow: 10 },
  );
  assert.equal(result, "consistent");
  assert.equal(attempts, 4);
  assert.ok(performance.now() - start >= 10 + 20 + 40 - 5);
});

test("removeRaceCondition also handles sync throws", async () => {
  let attempts = 0;
  const result = await removeRaceCondition(() => {
    if (++attempts < 2) throw new Error("race");
    return 7;
  }, { initialWindow: 1 });
  assert.equal(result, 7);
});

// Runs last: calibration changes the sleep factor for every later wait.
test("calibrate never speeds things up and scales later waits", async (t) => {
  t.mock.method(console, "info", () => {});
  const factor = calibrate();
  assert.ok(factor >= 1);
  const start = performance.now();
  await waitForConsistency(10);
  assert.ok(performance.now() - start >= 10 * factor - 5);
});
