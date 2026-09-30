import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { ErrorRemover, errorFree, removeErrors } from "../src/index.ts";

test("sync errors become undefined", () => {
  assert.equal(removeErrors(() => { throw new Error("boom"); }), undefined);
});

test("successful results pass through", () => {
  assert.equal(removeErrors(() => 42), 42);
});

test("async rejections resolve to undefined", async () => {
  assert.equal(await removeErrors(async () => { throw new Error("boom"); }), undefined);
  assert.equal(await removeErrors(async () => "ok"), "ok");
});

test("errorFree wraps a function and keeps this/args", () => {
  const obj = {
    base: 10,
    add(n: number) {
      if (n < 0) throw new Error("negative");
      return this.base + n;
    },
  };
  const safeAdd = errorFree(obj.add);
  assert.equal(safeAdd.call(obj, 5), 15);
  assert.equal(safeAdd.call(obj, -1), undefined);
});

test("global removal keeps a crashing process alive", () => {
  const script = `
    import { ErrorRemover } from ${JSON.stringify(new URL("../src/index.ts", import.meta.url).href)};
    ErrorRemover.global();
    setTimeout(() => { throw new Error("nobody will ever know"); });
    Promise.reject(new Error("neither will this"));
    setTimeout(() => console.log("still alive"), 20);
  `;
  const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.equal(out.trim(), "still alive");
});
