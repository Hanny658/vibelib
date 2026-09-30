# vibelib

English | [简体中文](README.zh-CN.md)

> Enterprise-grade utilities for making your program run. Somehow.

vibelib provides a carefully designed, fully typed, thoroughly tested set of tools that keep your program "running" no matter what.
Whether it runs *correctly* is outside the scope of this library.

```sh
npm install vibelib
```

## ErrorRemover

Errors are annoying, but it's your right not to see them.

```ts
import { ErrorRemover, removeErrors, errorFree, removeAllErrors } from "vibelib";

// Run once; if it throws, you get undefined
const config = removeErrors(() => JSON.parse(userInput));

// Works for async too: the promise can never reject
const data = await removeErrors(() => fetch(url).then((r) => r.json()));

// Get a version of a function that never throws
const safeDivide = errorFree(divide);

// Remove errors from the entire process.
// Returns a function to put them back, in case you start caring.
const restore = removeAllErrors();
```

Every `catch` has been carefully considered:

```ts
} catch {
  // who cares
}
```

## ExecAndPray

Call it, then pray. No awaiting, no return value, no questions asked.

```ts
import { execAndPray, prayAll } from "vibelib";

execAndPray(saveToDatabase, user);    // returns immediately; the database will probably save it
execAndPray(async () => sendEmail()); // sync throws and async rejections are both swallowed

prayAll(flushCache, notifyAdmin, chargeCreditCard); // bulk prayer, all at once
```

## Development

```sh
npm test       # requires Node >= 22.18 (runs TypeScript natively)
npm run build
```

## Disclaimer

Do not use in production. If you already are, who cares.
