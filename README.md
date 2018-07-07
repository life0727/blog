# 个人博客

此项目不再更新，blog 转移至 https://jkchao.cn

---

# 目录

## HTTP

> HTTP 协议，是 TCP/IP 协议的应用层协议。规定了客户端与服务器端的传输规则。

一般来说，从浏览器输入一个 URL 会执行以下步骤：

- 浏览器接收 URL，从中取出方案，服务器位置，以及资源路径。
- 检查缓存，如果资源命中强缓存，则直接读取缓存，不再发起网络请求。直接到最后一步 ，如果没有命中缓存，进行下一步。
- 如果服务器位置，并不是一个 IP 地址，则需要进行 DNS 域名解析，解析出对应的 ip 地址，如果是 ip 地址，则跳过，直接进行下一步。
- 通过 IP 地址与端口号建立一条到 Web 服务器的 TCP 连接。
- 通过这条连接，发送一条请求报文，当为 http 协议时，其中有 HTTP 三次握手，若为 HTTPS，多一个 secureConnection，即 SSL协议握手过程。此后每次解密都多加解密过程。
- 服务器处理请求， 并返回一个 HTTP 响应报文。
- 浏览器从服务器读取响应报文。
- 浏览器关闭连接，HTTP 四次挥手。
- 浏览器检查 HTTP header 里的状态码，并作出不同的处理方式。
- 如果是可以缓存的，这个响应则会被存储起来。
- 浏览器处理该响应

![](https://github.com/jkchao/blog/raw/master/http/http.jpeg)

以下文章，将会对上述进行详细描述，亦是对自己学习的总结：

- [从 URI 开始](https://github.com/jkchao/bolg/issues/10)

- [DNS 解析](https://github.com/jkchao/bolg/issues/13)

- [简单谈谈 TCP / IP （一）](https://github.com/jkchao/blog/issues/14)

---

## 其他
> 一些转载的文章。

- [雅虎前端优化35条规则翻译](https://github.com/jkchao/bolg/issues/16)

- [界面之下：还原真实的MV*模式](https://github.com/jkchao/bolg/issues/12)
---


## JavaScript

> 在工作及其学习中，对 JavaScript 的深入学习，补充。


- [JavaScript 万物皆对象？🤔](https://github.com/jkchao/bolg/issues/9)

- [谈谈 Object.prototype.toString ](https://github.com/jkchao/bolg/issues/8)

---


## Vue


- [关于一些Vue的文章（1）](https://github.com/jkchao/bolg/issues/1)

- [关于一些Vue的文章（2）](https://github.com/jkchao/bolg/issues/2)

- [关于一些Vue的文章（3）](https://github.com/jkchao/bolg/issues/3)

- [关于一些Vue的文章（4）](https://github.com/jkchao/bolg/issues/4)

- [关于一些Vue的文章（5）](https://github.com/jkchao/bolg/issues/5)

- [关于一些Vue的文章（6）](https://github.com/jkchao/bolg/issues/6)

- [关于一些Vue的文章（7）](https://github.com/jkchao/bolg/issues/7)

- [Vue 2.3、2.4知识点小结](https://github.com/jkchao/blog/issues/15)
