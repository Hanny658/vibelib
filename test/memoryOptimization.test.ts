import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryOptimization, absorbedObjectCount, memoryLeakAbsorber } from "../src/index.ts";

test("returns the same value, untouched", () => {
  const user = { name: "Ada", tags: ["admin"] };
  assert.equal(memoryLeakAbsorber(user), user);
  assert.deepEqual(user, { name: "Ada", tags: ["admin"] });
});

test("every call re-manages one more object, even the same one", () => {
  const before = absorbedObjectCount();
  const config = { retries: 3 };
  memoryLeakAbsorber(config);
  memoryLeakAbsorber(config);
  MemoryOptimization.memoryLeakAbsorber(config);
  assert.equal(absorbedObjectCount(), before + 3);
});

test("keeps a deep copy, not a reference", (t) => {
  const clone = t.mock.method(globalThis, "structuredClone");
  const nested = { a: { b: { c: [1, 2, 3] } } };
  memoryLeakAbsorber(nested);
  assert.equal(clone.mock.callCount(), 1);
  const stored = clone.mock.calls[0]!.result as typeof nested;
  assert.deepEqual(stored, nested);
  assert.notEqual(stored, nested);
  assert.notEqual(stored.a.b.c, nested.a.b.c);
});

test("handles cycles and things that can't be cloned", () => {
  const before = absorbedObjectCount();
  const cyclic: { self?: unknown } = {};
  cyclic.self = cyclic;
  memoryLeakAbsorber(cyclic);
  const fn = () => 42;
  assert.equal(memoryLeakAbsorber(fn), fn);
  assert.equal(absorbedObjectCount(), before + 2);
});

test("there is no way to free anything", () => {
  assert.deepEqual(Object.keys(MemoryOptimization).sort(), ["absorbedObjectCount", "memoryLeakAbsorber"]);
});
