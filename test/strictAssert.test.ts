import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { StrictAssert, strictAssert, strictAssertEventually } from "../src/index.ts";

test("true passes immediately and narrows the type", () => {
  const value: string | null = Math.random() >= 0 ? "ok" : null;
  strictAssert(value);
  assert.equal(value.length, 2);
});

test("function conditions are retried until they hold", () => {
  let attempts = 0;
  strictAssert(() => ++attempts >= 5);
  assert.equal(attempts, 5);
});

test("throwing conditions count as false and are retried", () => {
  let attempts = 0;
  StrictAssert.that(() => {
    if (++attempts < 3) throw new Error("not yet");
    return true;
  });
  assert.equal(attempts, 3);
});

test("strictAssertEventually lets the event loop make it true", async () => {
  let ready = false;
  setTimeout(() => { ready = true; }, 20);
  await strictAssertEventually(() => ready);
  assert.equal(ready, true);
});

test("strictAssertEventually handles async conditions that reject", async () => {
  let attempts = 0;
  await StrictAssert.eventually(async () => {
    if (++attempts < 3) throw new Error("not yet");
    return true;
  });
  assert.equal(attempts, 3);
});

test("a plain false never lets the program continue", () => {
  const script = `
    import { strictAssert } from ${JSON.stringify(new URL("../src/index.ts", import.meta.url).href)};
    strictAssert(false);
    console.log("unreachable");
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    timeout: 500,
  });
  assert.equal(result.signal, "SIGTERM");
  assert.equal(result.stdout, "");
});
