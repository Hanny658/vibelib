import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><div id=root></div>");
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });

const { act, createElement: h, useState } = await import("react");
const { createRoot } = await import("react-dom/client");
const { useRealCallback, useRealState } = await import("../src/react.ts");

async function render(element: ReturnType<typeof h>) {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(element));
  const click = (selector: string) =>
    act(async () => {
      container.querySelector<HTMLElement>(selector)!.click();
    });
  return { container, click, unmount: () => act(async () => root.unmount()) };
}

test("useRealState only updates after enough clicks", async () => {
  function Counter() {
    const [count, setCount, gate] = useRealState(0, { threshold: 3 });
    return h("button", { onClick: () => setCount((c) => c + 1), "data-level": gate.level }, String(count));
  }
  const { container, click, unmount } = await render(h(Counter));
  const button = () => container.querySelector("button")!;
  await click("button");
  await click("button");
  assert.equal(button().textContent, "0");
  assert.equal(button().dataset.level, "2");
  await click("button");
  assert.equal(button().textContent, "1");
  assert.equal(button().dataset.level, "0");
  await unmount();
});

test("useRealState accepts a lazy initializer", async () => {
  function Lazy() {
    const [value] = useRealState(() => "computed once");
    return h("p", null, value);
  }
  const { container, unmount } = await render(h(Lazy));
  assert.equal(container.textContent, "computed once");
  await unmount();
});

test("useRealCallback runs the latest callback only on the Nth click", async () => {
  const submitted: number[] = [];
  function Form() {
    const [draft, setDraft] = useState(0);
    const submit = useRealCallback(() => submitted.push(draft), { threshold: 2 });
    return h(
      "div",
      null,
      h("button", { id: "edit", onClick: () => setDraft((d) => d + 1) }),
      h("button", { id: "submit", onClick: submit }),
    );
  }
  const { click, unmount } = await render(h(Form));
  await click("#submit");
  assert.deepEqual(submitted, []);
  await click("#edit");
  await click("#submit");
  assert.deepEqual(submitted, [1]);
  await unmount();
});
