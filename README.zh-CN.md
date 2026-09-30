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

调用它，然后祈祷。不等待、不返回、不追问。

```ts
import { execAndPray, prayAll } from "vibelib";

execAndPray(saveToDatabase, user);    // 立即返回，数据库大概会存上吧
execAndPray(async () => sendEmail()); // 同步异常和异步 reject 都会被吞掉

prayAll(flushCache, notifyAdmin, chargeCreditCard); // 批量祈祷，一次到位
```

## 开发

```sh
npm test       # 需要 Node >= 22.18（原生运行 TS）
npm run build
```

## 免责声明

请勿在生产环境中使用。如果你已经在用了，who cares。
