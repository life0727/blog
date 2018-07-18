在 2.5.0 版本中，Vue 大大改进了类型声明系统以更好地使用默认的基于对象的 API。

意味着当我们**仅是安装 Vue 的声明文件**时，一切也都将会按预期进行：

- this，就是 Vue。
- this 上，具有 Methods 选项上定义的同名函数属性。
- 在实例 data、computed、prop 下定义的属性/方法，也都将会出现在 this 属性上。
- ......

在这篇文章里，我们来谈谈上述背后的故事。

## Methods

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

我们创建一个 Vue 的实例，传入组件选项。此时 this 不仅具有 Vue 实例上属性，同时也具有与 Methods 选项上的同名函数属性。

简单起见，我们把组件选项的声明改写成以下方式：

首先是 methods：

```typescript
// methods 是 key 为 string，value 为函数的集合
type Methods = Record<string, (this: Vue) => any>
```

这会存在一个问题，methods 下定义的方法里的 this，全部都是 Vue 构造函数上的方法，而不能访问我们自定义的方法。需要把 Vue 实例作为范型传进去：

```typescript
type Methods<V> = Record<string, (this: V) => any>
```

接着是组件选项（同样也需要传实例）：

```typescript
interface ComponentOption<V> {
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

在 Vue 的声明文件里，使用了一种简单的方式：通过使用 `ThisType<T>` 映射类型，让 this 具有所需要的属性。

在 `ThisType<T>` 的 [PR ](https://github.com/Microsoft/TypeScript/pull/14141) 下，有一个使用例子：


![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG321.jpeg)

在这个例子中，通过对 methods 的值使用 `ThisType<D & M>`，从而 TypeScript 能推导出 methods 对象中 this 即是： `{ x: number, y: number } & { moveBy(dx: number, dy: number ): void }` 。

与此类似，我们可以让 this 具有 Methods 上的方法：

```typescript
type DefaultMethods<V> = Record<string, (this: V) => any>

interface ComponentOption<
  V,
  Methods = DefaultMethods<V>
> {
  methods: Methods,
  created?(): void
}

declare function testVue<V extends Vue, Methods> (
  option: ComponentOption<V, Methods> & ThisType<V & Methods>
): V & Methods

testVue({
  methods: {
    test () {}
  },
  created () {
    this.test() // 编译通过
    this.$el    // 实例上的属性
  }
})
```

在上面代码中，我们：

- 创建了一个 ComponentOption interface，它有两个参数，当前实例 Vue 与 默认值是 `[key: string]: (this: V) => any` 的 Methods。
- 定义了一个函数 testVue，同时将范型 V, Methods 传递给 ComponentOption 与 ThisType。`ThisType<V & Methods>` 标志着实例内的 this 即是 V 与 Methods 的交叉类型。
- 当 testVue 函数被调用时，TypeScript 推断出 Methods 为 `{ test (): void }`，从而在实例内 this 即是：`Vue & { test (): void }`;


## Data
不同于 Methods，组件 Data 可有两种不同类型，Object 或者 Function。它的类型写法如下：

```typescrpt
type DefaultData<V> =  object | ((this: V) => object)
```
同样，我们也把 ComponentOption 与 testVue 稍作修改

```typescript
interface ComponentOption<
  V,
  Data = DefaultData<V>,
  Methods = DefaultMethods<V>
> {
  data: Data
  methods?: Methods,
  created?(): void
}

declare function testVue<V extends Vue, Data, Methods> (
  option: ComponentOption<V, Data, Methods> & ThisType<V & Data & Methods>
): V & Data& Methods

```

当 Data 是 Object 时，它能正常工作：

```typescript
testVue({
  data: {
    testData: ''
  },
  created () {
    this.testData // 编译通过
  }
})
```

当我们传入 Function 时，它并不能：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG325.jpeg)

TypeScript 推断出 Data 是 `(() => { testData: string })`，这并不是期望的 `{ testData: string }`，我们需要对函数参数 options 的类型做少许修改，当 Data 传入为函数时，取函数返回值：

```typescript
declare function testVue<V extends Vue, Data, Method>(
  option: ComponentOption<V, Data | (() => Data), Method> & ThisType<V & Data & Method>
): V  & Data & Method
```

这时候编译可以通过：

```typescript
testVue({
  data () {
    return {
      testData: ''
    }
  },

  created () {
    this.testData // 编译通过
  }
})
```

## Computed

Computed 的处理似乎有点棘手：与 Methods 不同，当我们在 Methods 中定义了一个方法，this 也会含有相同名字的函数属性，而在 Computed 中定义具有返回值的方法时，我们期望 this 含有函数返回值的同名属性。

举个在 Vue 中的简单例子：

```typescript
new Vue({
  computed: {
    testComputed () {
      return ''
    }
  },
  methods: {
    testFunc () {}
  },

  created () {
    this.testFunc()   // testFunc 是一个函数
    this.testComputed // testComputed 是 string，并不是一个返回值为 string 的函数
  }
})

```

我们需要一个映射类型，把定义在 Computed 内具有返回值的函数，映射为 key 为函数名，值为函数返回值的新类型。

```typscript
type Accessors<T> = {
  [K in keyof T]: (() => T[K])
}
```

接着，我们补充上例：

```typescript
// Computed 是一组 [key: string]: any 的集合
type DefaultComputed = Record<string, any>

interface ComponentOption<
  V,
  Data = DefaultData<V>,
  Computed = DefaultComputed,
  Methods = DefaultMethods<V>
> {
  data?: Data,
  computed?: Accessors<Computed>
  methods?: Methods,
  created?(): void
}

declare function testVue<V extends Vue, Data, Compted, Methods> (
  option: ComponentOption<V, Data | (() => Data), Compted, Methods> & ThisType<Data & Compted & Methods & V>
): V & Data & Compted & Methods

testVue({
  computed: {
    testComputed () {
      return ''
    }
  },
  created () {
    this.testComputed
  }
})

```

当调用 testVue 时，我们传入一个属性为 `testComputed () => ''` 的 Computed，TypeScript 会尝试将类型映射至 `Accessors<T>`，从而 Computed 即是 `{ testComputed: string }`。

此外，Computed 具有另一个写法：get 与 set 形式，我们只需要把映射类型做相应补充即可：

```typescript
interface ComputedOptions<T> {
  get?(): T,
  set?(value: T): void
}

type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}
```

## Prop

在上篇文章[在 Vue 中使用 TypeScript 的一些思考（实践）](https://jkchao.cn/article/5b3d3bbef9d34142a117b184)中，我们已经讨论了 Prop 的推导，在此不再赘述。

## 最后



## 参考
- https://github.com/Microsoft/TypeScript/pull/14141
- http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#mapped-types
- https://github.com/vuejs/vue/blob/dev/types/options.d.ts
