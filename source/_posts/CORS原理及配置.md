---
tag: Basic
---

## 1 同源策略和跨域
### 1.1 同源策略概念
同源策略（same-origin policy）是浏览器层实现的一种安全机制，非同源资源间的某些行为会受到限制。

“同源”要求资源在三个方面相同：

* 域名
* 协议
* 端口号

非同源下，受限制行为主要包括：

* Ajax请求
* Cookie、LocalStorage等读取
* DOM获取

非同源下，不受限制的行为主要包括：

* 页面中的链接、重定向、表单提交
* 静态资源引入。包括js、css、图片等。

### 1.2 为什么要跨域
在一个域下通过受同源策略限制的方式请求另一个域下资源时，就要进行跨域处理，最常见的就是js ajax请求，比如以下场景：
1、开发测试过程中，FE在本地/前端开发机起的项目，调RD、QA机器上部署的接口
2、线上业务调其他域名接口，比如代理商系统（eduagent.baidu.com）调文库（wenku.baidu.com）上传接口

### 1.3 跨域方式

跨域的方式有很多，常用在ajax请求中的包括：

* CORS
* JSONP：利用script不受限，向server传函数供server调用并传入数据。

其他方式包括：

* 降域：document.domain设置域名范围，比如：b.baidu.com —> baidu.com 
* postMessage
* window.name

## 2 CORS
CORS全称"跨域资源共享"（Cross-origin resource sharing），在浏览器支持、服务端配置的情况下，允许ajax跨域请求。

* 当页面有跨域请求时，浏览器自动对请求进行额外处理，并发送到服务端；
* 服务端通过浏览器的预处理，决定是否允许本次跨域请求，并在返回中带上相应的头；
* 当请求返回时，浏览器通过校验返回头，决定是否继续返回接口数据。
![](http://static.chiyuanyuan.com/P6DtUt.jpg)

## 3 浏览器请求
在浏览器端，CORS过程由浏览器自动完成，在脚本上不需要针对跨域ajax进行额外开发，也无法感知浏览器的预处理过程。

### 3.1 浏览器支持情况
目前浏览器对CORS的支持情况如图：
![](http://static.chiyuanyuan.com/13Gfsc.jpg)
其中IE8、9需要通过 XDomainRequest 实现。

### 3.2 简单请求/非简单请求
前面提到，当浏览器发现请求跨域，会自动进行预处理。在这个过程中，浏览器将跨域请求分为：

* 简单请求
* 非简单请求

仅当请求满足下面条件，才会被认为是简单请求，否则是非简单请求：

* 请求方法为以下三种之一
    * GET
    * POST
    * HEAD
* 请求HTTP头仅包含以下字段
    * Accept
    * Accept-Language
    * Content-Language
    * Last-Event-ID
    * Content-Type：application/x-www-form-urlencoded、multipart/form-data、text/plain

针对两种不同的请求，浏览器会选择不同的预处理方式。

## 4 简单请求流程
### 4.1 流程概览
![](http://static.chiyuanyuan.com/fFJB5n.jpg)

### 4.2 浏览器添加Origin头
对于简单请求，浏览器自动为请求头补充Origin字段。
这个字段要标明请求方的源信息，包括：域名、协议、端口，以供服务器判断是否许可本次跨域请求，例如：
![](http://static.chiyuanyuan.com/jXDFOa.jpg)

### 4.3 请求返回
不论服务器是否许可，本次请求均会正常返回到浏览器。
不同点在于：只有请求被许可，返回头才会包含Access-Control-Allow-Origin。
除此之外，被许可的跨域请求返回头可能多出其他字段。还是上面那次请求，返回头如下：
![](http://static.chiyuanyuan.com/cvZpiB.jpg)

三个头字段的解释：

* Access-Control-Allow-Origin：必须。值为请求头Origin或 * 
* Access-Control-Expose-Headers：可选。正常情况下，跨域返回只能拿到Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma六个头，如需额外头，在这里指定。
* Access-Control-Allow-Credentials：可选。是否允许请求携带cookie（后面会说）。

### 4.4 浏览器判断
当请求不被许可，即返回头缺失Access-Control-Allow-Origin字段，浏览器终止跨域请求并报错：

```
    Failed to load https://b.baidu.com: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'https://a.baidu.com' is therefore not allowed access.
    // 返回头没有Access-Control-Allow-Origin
```

## 5 非简单请求流程
### 5.1 流程概览
![](http://static.chiyuanyuan.com/64DCD5.jpg)
### 5.2 预检请求
当浏览器检测到非简单请求，会首先发送预检请求。
例如：在一次文件上传请求中，上传接口被调用两次，第一次即为预检请求：
![](http://static.chiyuanyuan.com/5PxjhS.jpg)
预检请求使用OPTIONS方法：
![](http://static.chiyuanyuan.com/wD1twJ.jpg)
一次预检请求的请求头如下：
![](http://static.chiyuanyuan.com/14fAfQ.jpg)
头部携带三个相关字段：

* Origin：必须。
* Access-Control-Request-Method：必须。正式请求的请求方法。
* Access-Control-Request-Headers：可选（例子中被省略）。正式请求额外发送的头字段。

### 5.3 预检请求返回
服务器进行预检请求处理，根据三个头部字段，决定是否许可本次跨域请求。
预检请求的返回头如下：
![](http://static.chiyuanyuan.com/FxoVMt.jpg)
对于许可的请求，服务器返回头携带五个相关字段：

* Access-Control-Allow-Origin：必须。同简单请求。
* Access-Control-Allow-Methods：必须。许可的请求方法，这里不是只列出请求头中的方法，而是列出所有支持的方法，可以减少预检请求次数。
* Access-Control-Allow-Headers：可选。同简单请求。
* Access-Control-Allow-Credentials：可选。同简单请求。
* Access-Control-Max-Age：可选。预检结果有效期，单位为s。

### 5.4 正式请求
当预检请求通过，浏览器才正式发送本次跨域请求，发送方式和返回同简单请求。
### 5.5 PHP中配置header
PreUpload.php
![](http://static.chiyuanyuan.com/HUOTid.jpg)

## 6 携带cookie
CORS默认是不携带cookie的。如果想携带cookie，需要浏览器端脚本和服务器端都做处理。

### 6.1 浏览器端处理
在浏览器端，需要为ajax请求添加携带cookie标识。
几种实现中添加方法如下：
原生

```
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

jQuery

```
$.ajax({
    ……
    xhrFields: {
        withCredentials: true
    },
……
```

fetch

```
fetch(……, {
    ……
    credentials: "include"
});
```

### 6.2 服务器端处理
服务器端也需要添加允许传cookie的头，就是前面说的：

```
Access-Control-Allow-Credentials：true
```
















