## 处理数组方法的弊端

  众所周知，Vue 在响应式的处理中，对数组与对象采用了不同的方式，如下源码所示：
  
```javascript
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

当值是数组时，Vue 通过拦截数组变异方法的方式来实现响应式，此种方式有两弊端：

- 通过索引设置项，Vue 不能监测到。
- 修改数组长度时，Vue 也不能监测到。

## 使用与处理纯对象相同的方式

既然在单独处理数组时，有以上弊端，那为什么不使用和纯对象一样的方式？

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
      console.log(this.test) // [5, 2, 3, 4, empty * 6]
    }
  }
})
</script>
```

当点击 button 时，能看到结果：
![](http://ovshyp9zv.bkt.clouddn.com/vue_data.jpeg)

Wait, 为什么数组里出现了 null ？

### null？empty?

当给数组设置 length 时，如果大于数组本身长度，新元素则会以 empty 填充，如下所示：

```javascript

const arr = [1, 2, 3]
arr.length = 5
console.log(arr) // [1, 2, 3, empty * 2]
```

empty 不同于 undefined，在遍历时，会被忽略：

```javascript
const arr = [1, 2, 3]
arr[5] = undefined

console.log(arr) // [1, 2, 3, empty * 2, undefined]

arr.forEach(item => console.log(item))

// 1 2 3 undefined
```

那么问题来了，上图中为什么出现 null？(`this.test` 打印出来正常，在 html 中渲染出 null)

为了探究此问题，我尝试在 html 中输出一个数组变量：

```javascript
const arr = [1, 2, 3]
document.write(arr)
```

可是事与愿违：

![](http://ovshyp9zv.bkt.clouddn.com/vue_dep.jpeg)

我好像得到了字符串。

换个对象试试：

```javascript
const obj = { a: 1 }
document.write(obj)
```

```html
[object Object]
```


`[object Object]` ???

不过好像也有点懂了，`[object Object]` 是 `obj.toString()` 的结果。也就是说，当你尝试在页面输出一个变量时，JavaScript 会自动调用 `toString()` 方法。

既然这样，为了让页面输出一个变量，需要把变量序列化：

```javascript
const arr = [1, 2, 3]
arr.length = 6
document.write(JSON.stringify(arr))
```

得到结果：

```javascript
[1, 2, 3, null, null, null]
```



## 大数组下的性能问题

从例子中可以看出，其实 Vue 是可以使用与处理纯对象的方式来处理数组的。官方解释不这么做的原因是出于对性能的考虑。

举个例子，由于数组长度的不确定性，如果数组长度过大，遍历加 getter/setter 的性能负担会很大。

为了验证性能的问题，我尝试使用两种不同方式：Vue 单独处理数组的方式以及和处理纯对象相同的方式，通过对比两者的 Load 时间，来对比性能。

测试代码：

```html
<div id="app">
  <div>{{ test }}</div>
</div>
<script>
const arr = new Array(100000)
new Vue({
  el: '#app',
  data: {
    test: arr
  }
})
</script>
```

当使用 Vue 单独处理数组的方式时：

![](http://ovshyp9zv.bkt.clouddn.com/vue_dep_1.jpeg)


当使用与处理纯对象相同的方式时：


![](http://ovshyp9zv.bkt.clouddn.com/vue_dep_2.jpeg)

可见性能上，前者还是好很多。毕竟遍历很长的数组，确实是一件很耗性能的事。