# vibelib

[English](README.md) | 简体中文

> Enterprise-grade utilities for making your program run. Somehow.

vibelib 提供一系列经过严肃设计、类型完备、测试齐全的工具，帮助你的程序在任何情况下都"正常运行"。
至于运行得对不对，那不在本库的职责范围内。

```sh
npm install vibelib
```

## ErrorRemover

错误很烦人，但你有权不看到它们。

```ts
import { ErrorRemover, removeErrors, errorFree, removeAllErrors } from "vibelib";

// 运行一次，出错就返回 undefined
const config = removeErrors(() => JSON.parse(userInput));

// 异步同样适用，Promise 永远不会 reject
const data = await removeErrors(() => fetch(url).then((r) => r.json()));

// 生成一个永不报错的函数版本
const safeDivide = errorFree(divide);

// 对整个进程移除错误。返回一个函数，万一你又开始在乎了
const restore = removeAllErrors();
```

所有 `catch` 都经过深思熟虑：

```ts
} catch {
  // who cares
}
```

## ExecAndPray

程序经常需要等待？那太慢了！调用它，然后祈祷。不等待、不返回、不追问。这样一来，程序性能大幅提升！

```ts
import { execAndPray, prayAll } from "vibelib";

execAndPray(saveToDatabase, user);    // 立即返回，数据库大概会存上吧
execAndPray(async () => sendEmail()); // 同步异常和异步 reject 都会被吞掉

prayAll(flushCache, notifyAdmin, chargeCreditCard); // 批量祈祷，一次到位
```

## TypeTrust

类型只是建议。只要你足够相信，任何值都可以是任何类型。

```ts
import { TypeTrust, trustMe, assumeType } from "vibelib";

// 把任何东西断言成任何类型
const user = trustMe<User>(JSON.parse(body)); // 它就是 User，相信我

// 断言函数：从这一行起收窄类型，但什么都不检查
const value: unknown = await fetchSomething();
assumeType<Order[]>(value);
value.map((o) => o.total); // 完美通过编译

TypeTrust.cast<number>("42");  // 现在是 number 了
TypeTrust.assume<string>(null); // 现在是 string 了
```

类型检查的实现经过精心设计：

```ts
export function assumeType<T>(value: unknown): asserts value is T {
  // trust me
}
```

## 开发

```sh
npm test       # 需要 Node >= 22.18（原生运行 TS）
npm run build
```

## 免责声明

大概不应该在生产环境中使用。如果你已经在用了，who cares。
