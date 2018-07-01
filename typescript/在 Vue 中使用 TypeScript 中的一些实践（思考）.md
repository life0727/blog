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








## 导入 vue 组件时，为什么会报错？



