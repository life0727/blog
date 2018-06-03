# TypeScript 里 import require 那些事

TypeScript 有一套自己的模块导入语法，写法如下：

```typescript
import foo = require('foo')
```

在这篇文章里，我们来谈谈它的一些事。

## ES6 模块导入的限制

我们先来看一个具体的例子：

在 node 项目里，通常使用 commonjs 的语法来导入一个模块：

```javascript
const foo = require('foo')
```

改写为 TypeScript 并使用 ES6 模块语法时（假设 foo 模块没有默认导出）：

```typescript
// 不允许从没有设置默认导出的模块中默认导入
// allowSyntheticDefaultImports: false
import * as foo from 'foo'
```
在这个改写后的文件里，`import * as` 创建了一个 foo 模块对象。ES6 规范对此对象做了些限制，它**规定 foo 对象不能被调用，不能用 new 来实例化，它只具有属性**。

使用 TypeScript 的模块导入语法没有此限制：

```typescript
import foo = require('foo')
```



