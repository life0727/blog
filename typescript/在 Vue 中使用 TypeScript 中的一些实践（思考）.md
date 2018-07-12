## Vue.extend or vue-class-component

使用 TypeScript 写 Vue 组件时，有两种推荐形式：

- `Vue.extend()`：使用基础 Vue 构造器，创建一个“子类”。此种写法与 Vue 单文件组件标准形式最为接近，唯一不同仅是组件选项需要被包裹在 `Vue.extend()` 中。
- `vue-class-component`：通常与 `vue-property-decorator` 一起使用，提供一系列装饰器，能让我们书写类风格的 Vue 组件。

两种形式输出结果一致，同是创建一个 Vue 子类，但在书写组件选项如 props，mixin 时，有些不同。特别是当你使用 `Vue.extend()` 时，为了让 TypeScript 正确推断类型，你将不得不做一些额外的处理。接下来，我们来聊一聊它们的细节差异。

### Prop

由于组件实例的作用域是孤立的，当从父组件传递数据到子组件时，我们通常使用 Prop 选项。同时，为了确保 Prop 的类型安全，我们会给 Prop 添加指定类型验证，形式如下：

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

这意味着我们可以使用 someProp 上的任意属性（存在或者是不存在的）都可以通过编译。为了防止此种情况的发生，我们将会给 Prop 添加类型注释。 

### Vue.extend()

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

实际上，我们可从 [Prop type declaration](https://github.com/vuejs/vue/blob/dev/types/options.d.ts#L129) ：

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
可知 Prop type 可以以两种不同方式出现：

- 含有一个调用签名的范型 type，该签名返回 T；
- 一个范型构造函数签名，该函数创建指定类型 T 对象 （返回值 `T & object`  用于降低优先级，当两种方式同时满足时取第一种，其次它还可以用于标记构造函数不应该返回原始类型）。
 
 
当我们指定 type 类型为 String/Number/Boolean/Array/Date/Function/Symbol 等原生构造函数时，Prop<T> 会返回它们各自签名的返回值，如：

```javascript
// lib.es5.d.ts

interface StringConstructor {
  new(value?: any): String;
  (value?: any): string;
  readonly prototype: String;
  fromCharCode(...codes: number[]): string;
}
```

当 type 类型为 String 构造函数时，它的调用签名返回为 string。

而这也是上文中，当指定 type 类型为 Object 构造函数时，经过 Vue 的声明文件处理，TypeScript 推断出为 any 类型的原因：

```javascript
interface ObjectConstructor {
  new(value?: any): Object;
  (): any;
  (value: any): any;
  // 其它属性 ....
}

```

类似的，当我们使用关键字 `as` 断言 Object 为 `() => User` 时，根据声明文件，此时推断出为 User 。

从 type 第二部分可知，除传入原生构造函数外，我们还可传入自定义类：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/Screen%20Shot%202018-07-04%20at%202.55.17%20PM.png)

此外，这里有个 [PR](https://github.com/vuejs/vue/pull/6856) 暴露一个更直观的类型，可以简化我们的代码（ Vue 2.6 版本才可以用）：

```javascript
props: {
  testProp: Object as PropTypes<{ test: boolean }>
}
```

### vue-class-component
得益于 vue-propperty-decorator Prop 修饰器，给 Prop 增加类型推断时，这些将变得简单：

```typescript
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Test extends Vue {
  @Prop({ type: Object })
  private test: { value: string }
}
```
当我们在组件内访问 test 时，便能获取正确的类型推断。

## mixins

mixins 是一种分发 Vue 组件中可复用功能的一种方式。当在 TypeScript 中使用它时，我们希望得到有关于 mixins 的类型信息。

当你使用 `Vue.extends()` 时，这有点困难，它并不能推断出 mixins 里的类型：

```javascript
// ExampleMixin.vue
export default Vue.extend({
  data () {
    return {
      testValue: 'test'
    }
  }
})

// other.vue
export default Vue.extend({
  mixins: [ExampleMixin],
  created () {
	this.testValue // error, testValue 不存在！
  }
})
```
我们需要稍作修改：

```javascript
// other.vue
export default ExampleMixin.extend({
  mixins: [ExampleMixin],
  created () {
	this.testValue // 编译通过
  }
})

```

但这会存在一个问题，当使用多个 mixins 且推断出类型时，这将无法工作。而在这个 [Issuse](https://github.com/vuejs/vue/issues/7211) 官方也明确表示，这无法被修改。

使用 vue-class-component 这会方便很多：

```javascript
// ExampleMixin.vue
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export class ExampleMixin extends Vue {
  public testValue = 'test'
}

// other.vue
import Component, { mixins } from 'vue-class-component'
import ExampleMixin from 'ExampleMixin.vue'

@Component
export class MyComp extends mixins(ExampleMixin) {
  created () {
    console.log(this.testValue) // 编译通过
  }
}

```
也支持可以传入多个 mixins。

## 一些其它
做为 Vue 中最正统的方法（与标准形式最为接近），`Vue.extends()` 有着自己的优势，在 VScode Vetur 插件辅助下，它能正确提示子组件上的 Props:

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG303.jpeg)

而类做为 TypeScript 特殊的存在（它既可以作为类型，也可以作为值），当我们使用 `vue-class-component`  并通过 `$refs` 绑定为子类组件时，便能获取子组件上暴露的类型信息：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG305.jpeg)

## 导入 .vue 时，为什么会报错？

当你在 Vue 中使用 TypeScript 时，所遇到的第一个问题即是在 ts 文件中找不到 .vue 文件，即使你所写的路径并没有问题：
![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG306.jpeg)

在 TypeScript 中，它仅识别 js/ts/jsx/tsx 文件，为了让它识别 .vue 文件，我们需要显式告诉 TypeScript，vue 文件存在，并且指定导出 VueConstructor：

```typescript
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
```
但是，这引起了另一个问题，当我们导入一个并不存在的 .vue 文件时，也能通过编译：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/WechatIMG307.jpeg)

是的，这在情理之中。

当我尝试在 .vue 文件中导入已存在或者不存在的 .vue 文件时，却得到不同的结果：

文件不存在时：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/Screen%20Shot%202018-07-05%20at%204.44.26%20AM.png)

文件存在时：

![](http://ovshyp9zv.bkt.clouddn.com/typescriptInVue/Screen%20Shot%202018-07-05%20at%204.43.45%20AM.png)

文件不存在时，引用 Vue 的声明文件。文件存在时，引用正确的文件定义。

这让人很困惑，而这些都是 Vetur 的功劳。

在这个 [PR](https://github.com/vuejs/vetur/pull/94) 下，我找到相关解答：Vetur 提供解析其他 .vue 文件的功能，以便能获取正确的信息，当 .vue 文件不存在时，会读取 .d.ts 里的信息。


## 参考

- https://github.com/vuejs/vue/pull/5887
- https://github.com/vuejs/vue/issues/7211
- https://github.com/vuejs/vue/pull/6856
- https://github.com/vuejs/vue/pull/5887/files/1092efe6070da2052a8df97a802c9434436eef1e#diff-23d7799dcc9e9be419d28a15348b0d99
- https://github.com/Microsoft/TypeScript/blob/8e47c18636da814117071a2640ccf87c5f16fcfd/src/compiler/types.ts#L3563-L3583
- https://github.com/vuejs/vetur/pull/94


