import { test } from "node:test";
import assert from "node:assert/strict";
import { execAndPray, prayAll } from "../src/index.ts";

test("returns before the async work finishes", async () => {
  let done = false;
  const ret = execAndPray(async () => {
    await new Promise((r) => setTimeout(r, 10));
    done = true;
  });
  assert.equal(ret, undefined);
  assert.equal(done, false);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(done, true);
});

test("sync throws and async rejections do not escape", async () => {
  execAndPray(() => { throw new Error("boom"); });
  execAndPray(async () => { throw new Error("boom"); });
  await new Promise((r) => setTimeout(r, 10));
});

test("passes arguments through", () => {
  let got: number | undefined;
  execAndPray((a: number, b: number) => { got = a + b; }, 2, 3);
  assert.equal(got, 5);
});

test("prayAll runs every function even if some fail", () => {
  const ran: number[] = [];
  prayAll(
    () => ran.push(1),
    () => { throw new Error("boom"); },
    () => ran.push(3),
  );
  assert.deepEqual(ran, [1, 3]);
});
