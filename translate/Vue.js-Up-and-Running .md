Until this point in the book, all data has been stored in our components. We hit an API, and we store the returned data on the data object. We bind a form to an object, and we store that object on the data object. All communication between components has been done using events (to go from child to parent) and props (to go from parent to child). This is good for simple cases, but in more complicated applications, it won’t suffice.

在之前的章节里，所有的数据都被存储在我们的组件里。我们调用一个 API，把返回的数据存储在数据对象里。我们将一个表单数据绑定至一个对象里，接着把这个对象存储在数据对象里。所有组件之间的通信都是通过 `event`（从子组件到父组件）与 `props`（从父组件到子组件）来完成的。在简单的场景里，这是很好的，但在大部分复杂的应用里，它并不能满足我们的需要。


Let’s take a social network app—specifically, messages. You want an icon in the top navigation to display the number of messages you have, and then you want a messages pop-up at the bottom of the page that will also tell you the number of messages you have. Both components are nowhere near each other on the page, so linking them using events and props would be a nightmare: components that are completely unrelated to notifications will have to be aware of the events to pass them through. The alternative is, instead of linking them together to share data, you could make sep‐ arate API requests from each component. That would be even worse! Each compo‐ nent would update at different times, meaning they could be displaying different things, and the page would be making more API requests than it needed to.

让我们来看一个社交应用，具体来说是它的消息部分。你希望有一个在顶部导航栏的图标，用来提示消息数量。同时，你也希望这个提示出现在页面的底部。在这个页面里，两个组件并不是父子组件关系，因此，使用 `event` 与 `props` 来使他们通信，似乎并不是一个可取的办法，


vuex is a library that helps developers manage their application’s state in Vue applica‐ tions. It provides one centralized store that you can use throughout your app to store and work with global state, and gives you the ability to validate data going in to ensure that the data coming out again is predictable and correct.

`Vuex`