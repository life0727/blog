# TypeScript 模块导入那些事

## ES6 模块导入的限制

我们先来看一个具体的例子：

在 Node 项目里，使用 commonjs 规范引入一个模块：

```javascript
const koa = require('koa')
```

改写为 TypeScript（1.5+ 版本）时，通常有两种方式：

- 使用 ES6 模块导入方式：

    ```typescript
    // allowSyntheticDefaultImports: false
    import * as koa from 'koa'
    ```
- 使用 TypeScript 模块导入语法：

    ```typescript
    import koa = require('koa')
    ```

两者大部分是等价的，但 ES6 规范对 `import * as` 创建出的模块对象有一点限制。 
根据该规范，该模块对象**不可被调用，也不可被实例化，它只具有属性**。

因此，如果你想调用该对象，或者使用 new 方法，在 `allowSyntheticDefaultImports: false` 的配置下，应该使用例子中的第二种方式。

在 2.7 的版本里，TypeScript 提供了一个新选项 `--esModuleInterop`，用于解决上述问题，
当使用该选项，且模块输出为 commonjs 时，它会导入一个可调用或是可实例化的模块，同时它规定该模块必须作为默认导入：

``` typescript
import koa from 'koa'
const app = new koa()
```

## 模块导入仅仅是一些声明类型

在以非相对路径导入一个模块时，你可能会看到 `Could not find a declaration file for module 'someModule'` 的错误， 此时你可以安装对应模块的声明文件或者写一个包含 `declare module 'someModule'` 的声明文件。

实际上，当我们导入一个模块时：

```typescript
import foo from 'foo'
// import foo = require('foo')
```

它所做的事情只有两个：

- 导入模块的所有声明类型；
- 确定运行时的依赖关系。





