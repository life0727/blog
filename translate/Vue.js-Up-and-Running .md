# 使用 vuex 进行状态管理

在之前的章节里，所有的数据都被存储在我们的组件里。我们调用一个 API，把返回的数据存储在数据对象里。我们将一个表单数据绑定至一个对象里，接着把这个对象存储在数据对象里。所有组件之间的通信都是通过 event（从子组件到父组件）与 props（从父组件到子组件）来完成的。在简单的应用里，这是很好的，但在大部分复杂的应用里，它并不能满足我们的需要。


让我们来看一个社交应用，具体来说是它的消息部分。你希望有一个在顶部导航栏的图标，用来提示消息数量。同时，你也希望这个提示出现在页面的底部。在这个页面里，两个组件之间并没有联系。因此，通过 event 与 props 来使他们通信，似乎并不是一个可取的办法，让完全没联系的组件之间通信，意味着你需要在它们之间传递事件。一个更合适的方式是让它们共享数据，而不是让它们相互之间联系。你可以在每个组件里使用一个额外的 API 请求，那会更加糟糕！每个组件将会在不同的时间点更新，意味着它们会表现出不同的事件，页面也将会发出比需要更多的 API 请求。

vuex 是一个帮助开发人员在 Vue 应用程序中管理其应用程序状态的库。它提供一个集中式存储的 store，你可以在你的整个应用里使用它来存储和处理全局的状态，并能让你验证数据，以确保发布的数据是可预测和正确的。


## 安装

你可以通过使用 CDN 的方式来使用 vuex，只需加入下面这行：

```html
<script src="https://unpkg.com/vuex"></script>
```


当然，如果你使用 npm ，也可以通过 `npm install --save vuex` 的方式来安装 vuex。如果你在使用如 webpack 之类的构建工具，可以像使用 vue-router 的方式来使用 vuex。此时，你需要使用 `vue.use()`：

```javascript
import Vue from 'vue';
import Vuex from 'vuex';Vue.use(Vuex);
```

然后，你需要配置 store。我们创建以下文件，并将它保存为 *store/index.js*：

```javascript
import Vuex from 'vuex';export default new Vuex.Store({
  state: {}});
```

目前为止，我们仅仅是创建了一个空的 store，在整个章节里，我们都会使用它。

接着，在你主要的应用文件里导入它，并且在创建 Vue 实例时作为属性添加：

```javascript
import Vue from 'vue';
import store from './store';new Vue({  el: '#app',
  store,
  components: {    App  }
});
```

现在，你已经在你的应用里添加了 store，并可以通过 `this.$store` 来获取 store。接下来，让我们看看 vuex 的相关概念，以及你可以用 `this.$store` 来做些什么事情。

## 概念

如本章导言所提及，当复杂的应用程序里需要多个组件共享状态时，vuex 可能是必需的。

让我们来看一个并没有用到 vuex 简单组件，它用来展示用户在页面的消息数量：

```javascript
const NotificationCount = {
  template: `<p>Messages: {{ messageCount }}</p>`,
  data: () => ({    messageCount: 'loading'  }),
  mouted() {
    const ws = new WebSocket('/api/messages');
    ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      this.messageCount = data.messages.length;
    });
  }
}

```

很简单，它开启了一个指向 */api/message* 的 websocket，当服务端发送一条信息到客户端，当 socket 打开（初始化信息数量），当信息数量更新（有新消息）时，在 socket 发送的信息会被记录，并且展示到页面上。

> 在实际应用里，这些代码将会复杂很多。这个例子里，没有 websocket 的验证，并且假定通过 websocket 的响应数据始终都是有效的 JSON，它是一个带有消息属性的数组，但实际上可能并不是。对于这个例子，这些简单的代码，已经能够完成这个工作。


当我们想要在同一个页面使用多个通知计数的组件时，遇到了麻烦。因为每个组件会开启一个websocket,这会创建重复且不必要的连接，并且由于网络延迟，组件可能会在稍微不同的时间点更新。为了解决这个问题，我们可以使用 vuex 来取代 websocket 的逻辑。

让我们深入了解一个例子。我们的组件将会像下面这样：

```javascript

const NotificationCount = {  template: `<p>Messages: {{ messageCount }}</p>`,
  computed: {    messageCount() {      return this.$store.state.messages.length;    }
  },  mounted() {
    this.$store.dispatch('getMessages');  } 
};

```

下面一段代码将会成为我们的 vuex store：

```javascript
let ws;
export default new Vuex.Store({
  state: {
    messages: []
  },
  mutations: {
    setMessages(state, messages) {
      state.messages = messages;
    }
  },
  actions: {
    getMessages({ commit }) {
      if (ws) {
        return;
      }
      
      ws = new WebSocket('/api/messages');
      
      ws.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        commit('setMessages', data.messages);
      })
    }
  }

})

```

现在，每个通知计数组件








