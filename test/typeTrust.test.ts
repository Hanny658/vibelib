import { test } from "node:test";
import assert from "node:assert/strict";
import { TypeTrust, assumeType, trustMe } from "../src/index.ts";

test("trustMe returns the exact same value", () => {
  const value = { definitely: "not a number" };
  const n = trustMe<number>(value);
  assert.equal(n, value);
});

test("assumeType never objects", () => {
  const value: unknown = "a string";
  assumeType<{ id: number }>(value);
  assert.equal(value.id, undefined);
});

test("TypeTrust.assume narrows through the namespace object", () => {
  const value: unknown = 42;
  TypeTrust.assume<string[]>(value);
  assert.equal(value.length, undefined);
  assert.equal(TypeTrust.cast<boolean>(null), null);
});
