import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { NullRemover, nullToUndefined, replaceNullWithRandom, waitUntilNotNull } from "../src/index.ts";

test("waitUntilNotNull passes non-null values straight through", async () => {
  assert.equal(await waitUntilNotNull(0), 0);
  assert.equal(await waitUntilNotNull(undefined), undefined);
});

test("waitUntilNotNull with a getter waits until the value shows up", async () => {
  let value: string | null = null;
  setTimeout(() => { value = "finally"; }, 20);
  const result: string = await waitUntilNotNull(() => value);
  assert.equal(result, "finally");
});

test("waitUntilNotNull with an async getter", async () => {
  let attempts = 0;
  const result = await NullRemover.waitUntilNotNull(async () => (++attempts < 3 ? null : attempts));
  assert.equal(result, 3);
});

test("waitUntilNotNull(null) keeps the process waiting forever", () => {
  const script = `
    import { waitUntilNotNull } from ${JSON.stringify(new URL("../src/index.ts", import.meta.url).href)};
    await waitUntilNotNull(null);
    console.log("unreachable");
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    timeout: 500,
  });
  assert.equal(result.signal, "SIGTERM");
  assert.equal(result.stdout, "");
});

test("nullToUndefined converts null and leaves everything else alone", () => {
  const converted: undefined = nullToUndefined(null);
  assert.equal(converted, undefined);
  assert.equal(nullToUndefined(0), 0);
  assert.equal(NullRemover.toUndefined(""), "");
});

test("replaceNullWithRandom leaves non-null values alone", () => {
  assert.equal(replaceNullWithRandom(42), 42);
  assert.equal(replaceNullWithRandom(undefined), undefined);
});

test("replaceNullWithRandom replaces null with a random non-null primitive", () => {
  for (let i = 0; i < 200; i++) {
    const value = NullRemover.randomize(null);
    assert.notEqual(value, null);
    assert.ok(["string", "number", "bigint", "boolean", "symbol", "undefined"].includes(typeof value));
  }
});
