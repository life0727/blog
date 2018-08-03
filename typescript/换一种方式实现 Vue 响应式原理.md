  众所周知，Vue 的响应式原理是使用 `Object.defineProperty` 追踪依赖，当属性被访问或被改变时通知变化。在对对象属性的添加或者删除方面，由于现代 JavaScript 的限制，Vue 并不能检测到；而在处理数组时，Vue 使用了区别于对象的方式，如下源码所示：
 
```javascript
 // ...

if (Array.isArray(value)) {
  const augment = hasProto
    ? protoAugment
    : copyAugment
  augment(value, arrayMethods, arrayKeys)
  this.observeArray(value)
} else {
  this.walk(value)
}

```

深入了解时，你将会发现 Vue 对于数组的处理是通过拦截数组变异方法的方式，也就是说当你通过索引改变项，或者修改数组长度时，Vue 都不能检测到。

基于以上两点，我从网上找![]()了几种代替方式，并应用于其中。

## 半吊子方法

上文提到 Vue 对于数组的处理采用不同的方式，自然而然想到的第一种方式便是修改源码，使其使用与处理对象一样的方式。

修改部分源码如下：

```javascript
if (Array.isArray(value)) {
  // const augment = hasProto
  // ? protoAugment
  // : copyAugment
  // augment(value, arrayMethods, arrayKeys)
  // this.observeArray(value)
  this.walk(value)
} else {
  this.walk(value)
}

```

接着，我们主要对数组测试两点，利用索引设置项，以及修改数组长度：


```html
<div id="app">
  <div>{{ test }}</div>
  <div>{{ test.length }}</div>
  <button @click="someMethod">button</button>
</div>
<script>
new Vue({
  el: '#app',
  data: {
    test: [1, 2, 3, 4]
  },
  methods: {
    someMethod () {
      this.test[0] = 5
      this.test.length = 10
    }
  }
})
</script>
```

当点击 button 时，能直观的看到结果：
![](http://ovshyp9zv.bkt.clouddn.com/vue_data.jpeg)

从这个例子中可知，其实 Vue 是可以使用与处理纯对象的方式来处理数组的，之所以采用修改原生操作数组的方式，无非就是性能问题。比如在大多数情况下，Vue 是不知道数组长度的，如果采用与处理对象相同的形式，那也就意味着需要依次 `defineReactive` ，数组长度小还好，过大的长度未免会损耗性能。

同时，这种方式也没有解决 Vue 检测不对对象的删除和添加，因此是个半吊子方法。

## Knockout 实现