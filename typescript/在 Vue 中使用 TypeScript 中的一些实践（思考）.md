## Vue.extend or vue-class-component

使用 TypeScript 写 Vue 组件时，有两种推荐形式：

- `Vue.extend()`：使用基础 Vue 构造器，创建一个“子类”。此种写法与 Vue 单文件组件标准形式最为接近，唯一不同的仅是组件选项需要被包裹在 `Vue.extend()` 中。
- `vue-class-component` ：通常与 `vue-property-decorator` 一起使用，提供一系列装饰器，能让我们书写类风格的 Vue 组件。

两种形式输出结果一致，同是创建一个 Vue 子类，但在处理组件选项如 props，mixin 时，却不尽相同。特别是当你使用 `Vue.extend()` 时，为了让 TypeScript 正确推断类型，你将不得不做一些额外的处理。接下来，我们来扒一扒它们的细节。

### prop

由于组件实例的作用域是孤立的，当从父组件传递数据到子组件时，我们通常使用 prop 选项。同时，为了确保 prop 的类型安全，我们会给 prop 添加指定类型验证，形式如下：

```javascript
<script>
export default {
  props: {
    someProp: {
      type: Object,
      requird: true,
      default: () => ({ message: 'test' })
    }
  }
}
</script>
```

我们定义了一个 someProp，它的类型是 Object。

使用 JavaScript 时，这并没有什么不对的地方，但当你使用 TypeScript 时，这有点不足，我们并不能得到有关于 someProp 更多有用的信息（比如它含有某些属性），甚至在 TypeScript 看来，这将会是一个 any 类型：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG298.jpeg?imageView2/2/w/450)

这意味着我们可以使用 someProp 上的任意属性（存在或者是不存在的）都可以通过编译。为了防止此种情况的发生，我们将会给 prop 添加类型注释。 

使用 `Vue.extend()` 方法添加类型注释时，需要给 type 断言：

```typescript
import Vue from 'vue'

interface User {
  id: number,
  age: number
}

export default Vue.extend({
  props: {
    testProps: {
      type: Object as () => User
    }
  }
})

```

当组件内访问 testProps 时，便能得到相关提示：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/Screen%20Shot%202018-07-02%20at%2011.11.24%20AM.png)

然而，你必须以函数返回值的形式断言，并不能直接断言：

```typescript
export default Vue.extend({
  props: {
    testProps: {
      type: Object as User
    }
  }
})
```

他会给出错误警告，User 接口并没有实现原生 Object 构造函数所执行的方法。
***Type 'ObjectConstructor' cannot be converted to type 'User'. Property 'id' is missing in type 'ObjectConstructor'.***

实际上，我们可以从 prop type declaration：

```typescript
export type Prop<T> = { (): T } | { new (...args: any[]): T & object }

export type PropValidator<T> = PropOptions<T> | Prop<T> | Prop<T>[];

export interface PropOptions<T=any> {
  type?: Prop<T> | Prop<T>[];
  required?: boolean;
  default?: T | null | undefined | (() => object);
  validator?(value: T): boolean;
}

```
可知 prop type 是一个联合类型，它包含以下两部分：

- 一个返回值为 T 的范型函数；
- 一个范型构造函数，该函数创建指定类型 T 的对象。
 
 
当我们指定 type 类型为 Object 构造函数时，

当我们使用关键字 `as` 断言 Object 为 `() => User` 时，根据声明文件，此时 T 为 User, 即 ｀Prop<User>｀，返回类型为 User 的对象。于是 TypeScript 便可以正确推断类型。






## 导入 vue 组件时，为什么会报错？
