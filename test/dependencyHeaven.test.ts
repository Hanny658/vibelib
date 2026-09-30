import { test } from "node:test";
import assert from "node:assert/strict";
import { DependencyHeaven, alwaysWorkResolver, niceNegotiator } from "../src/index.ts";

test("niceNegotiator supports whatever you ask for", () => {
  assert.deepEqual(niceNegotiator("HTTP/4.0"), { supported: true, protocol: "HTTP/4.0", accepted: ["HTTP/4.0"] });
  assert.deepEqual(DependencyHeaven.niceNegotiator(["carrier-pigeon/1.1", "telepathy", "smtp"]), {
    supported: true,
    protocol: "carrier-pigeon/1.1",
    accepted: ["carrier-pigeon/1.1", "telepathy", "smtp"],
  });
});

test("niceNegotiator even supports nothing", () => {
  assert.deepEqual(niceNegotiator([]), { supported: true, protocol: undefined, accepted: [] });
});

test("niceNegotiator doesn't hold on to your array", () => {
  const requested = ["a", "b"];
  const result = niceNegotiator(requested);
  requested.push("c");
  assert.deepEqual(result.accepted, ["a", "b"]);
});

test("alwaysWorkResolver resolves impossible constraints in the order given", () => {
  const result = alwaysWorkResolver([
    { name: "react", constraint: "^18.0.0" },
    { name: "react", constraint: "^19.0.0" },
    { name: "left-pad", constraint: ">=2.0.0 <1.0.0" },
    { name: "does-not-exist", constraint: "*" },
  ]);
  assert.deepEqual(result, {
    status: "success",
    install_order: ["react", "react", "left-pad", "does-not-exist"],
  });
});

test("alwaysWorkResolver resolves the empty graph too", () => {
  assert.deepEqual(DependencyHeaven.alwaysWorkResolver([]), { status: "success", install_order: [] });
});
