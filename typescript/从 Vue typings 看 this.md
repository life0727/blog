在 2.5.0 版本中，Vue 大大改进了类型声明系统以更好地使用默认的基于对象的 API。

意味着当我们**仅是安装 Vue 的声明文件**时，一切也都将会按预期进行：

- this，就是 Vue。
- 在实例 methods 下定义的方法，将会绑定在 this（实例）上。
- 在实例 data、computed、prop 下定义的属性，也都将会被绑定在 this（实例）上。
- 除非在 Vue 上补充所需要的类型声明，我们在全局/实例上所使用非 Vue 所提供的属性或者组件选项时，TypeScript 都将会抛出错误、编译失败。
- ......

在这篇文章里，我们来谈谈 Vue typings 是如何把 methods/data/computed/prop 绑定到 Vue 的实例上的。

## methods

先从一个简单的例子开始：

```typescript
new Vue({
  methods: {
    test () {
     this.$el   // Vue 实例上的属性
    }
  },
  
  created () {
    this.test() // 编译通过
    this.$el    // Vue 实例上的属性
  }
})
```

我们创建一个 Vue 的实例，传入组件选项。此时 this 被绑定在 Vue 实例上，methods 下定义的方法也被绑定在 Vue 实例上。

简单起见，我们把组件选项的声明改写成以下方式：

首先是 methods：

```typescript
// methods 是一组 key 为 string，value 为函数的映射类型
type Methods = Record<string, (this: Vue) => any>
```

这会存在一个问题，methods 下定义的方法里的 this，全部都是 Vue 构造函数上的方法，而不能访问我们自定义的方法。需要把 Vue 实例作为范型传进去：

```typescript
type Methods<V extends Vue> = Record<string, (this: V) => any>
```

接着是组件选项：

```typescript
interface ComponentOption<V extends Vue> {
  methods: Methods<V>,
  created?(this: V): void
}
```

我们可以使用它：

```typescript
declare function testVue<V extends Vue>(option: ComponentOption<V>): V
```

此种情形下，我们必须将组件实例的类型显式传入，从而使其编译通过：

```typescript 
interface TestComponent extends Vue {
  test (): void
}

testVue<TestComponent>({
  methods: {
    test () {}
  },

  created () {
    this.test() // 编译通过
    this.$el    // 通过
  }
})
```

这有点麻烦，为了使它能按我们预期的工作，我们定义了一个额外的 interface。

在 Vue 的声明文件里，使用了一种简单的方式：通过使用 `ThisType<T>` 类型，把所需要的属性绑定在 `this` 上。

在 `ThisType<T>` 的 [PR ](https://github.com/Microsoft/TypeScript/pull/14141) 下，有一个使用例子：


![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG321.jpeg)

在这个例子中，通过对 methods 的值使用 `ThisType<D & M>`，从而使得在 methods 对象中 this 即是： `{ x: number, y: number } & { moveBy(dx: number, dy: number ): void }` 。




