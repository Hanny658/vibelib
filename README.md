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

Programs spend too much time waiting? That's way too slow! Call it, then pray. No awaiting, no return value, no questions asked. Your program's performance just went through the roof!

```ts
import { execAndPray, prayAll } from "vibelib";

execAndPray(saveToDatabase, user);    // returns immediately; the database will probably save it
execAndPray(async () => sendEmail()); // sync throws and async rejections are both swallowed

prayAll(flushCache, notifyAdmin, chargeCreditCard); // bulk prayer, all at once
```

## TypeTrust

Types are just suggestions. Any value can be any type, as long as you believe hard enough.

```ts
import { TypeTrust, trustMe, assumeType } from "vibelib";

// Cast anything to anything
const user = trustMe<User>(JSON.parse(body)); // it's a User, trust me

// Assertion function: narrows the type from this line onward, checks nothing
const value: unknown = await fetchSomething();
assumeType<Order[]>(value);
value.map((o) => o.total); // compiles perfectly

TypeTrust.cast<number>("42");  // a number now
TypeTrust.assume<string>(null); // a string now
```

The type check is carefully implemented:

```ts
export function assumeType<T>(value: unknown): asserts value is T {
  // trust me
}
```

## Development

```sh
npm test       # requires Node >= 22.18 (runs TypeScript natively)
npm run build
```

## Disclaimer

You probably shouldn't use this in production. If you already are, who cares.
