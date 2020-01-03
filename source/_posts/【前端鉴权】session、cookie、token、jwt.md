---
tag: Server
---

## 鉴权
### 鉴权要解决的问题
#### 登录操作
当一个用户进行登录操作，通常会访问数据库校验账号、密码等信息，并获得用户名、角色等信息。
#### HTTP的无状态性
然而HTTP是无状态的，即使用户登录过，接下来的HTTP请求也是独立存在的，其一不知道用户是否登录过，其二不知道用户数据。
#### 鉴权要解决的问题
鉴权就是要通过某种方式，使用户在登录一次后，在后续某段时间内发起请求时，服务器能识别用户的登录状态，并能获取用户数据。
#### 鉴权思路
很显然，客户端需要保存某种凭证，以供服务器验证和获取数据。
### cookie-session、token鉴权方式对比

| 方式 | 客户端凭证存储 | 服务端存储 | 解决方案 | 使用场景 |
|---|---|---|---|---|
| cookie-session | cookie | redis/内存 | express-session | web系统 |
| token | cookie/local storage/param等 | - | cookie-session/JWT | web/app等 |

## session-cookie
在一些web系统中，通过cookie和session结合的方式认证，称为session-cookie。
### 概念
#### cookie
cookie是一种存储在浏览器端的数据，有一定的有效期和有效域。    
服务端通过set-cookie头通知浏览器添加一条cookie记录，浏览器在指定有效期内向指定域发起HTTP请求时则会把记录携带在HTTP头中。    
cookie使服务器具备对客户端标记的能力，从而管理HTTP会话状态。
#### session
session是一个抽象的概念，可以理解为某一客户端在一系列同服务器的会话中，服务端记录该客户端对应会话状态的机制。  
session实体通常包括：一个标记客户端唯一性的id、一份id对应的会话状态数据。
### session-cookie原理
![](http://static.chiyuanyuan.com/91C5B273-BD8B-4D8A-AF13-906FCFCE94CD.png)
#### 登录阶段
用户登录，服务器验证账号密码后，获取用户信息，并生成一个session_id，这个id是唯一的，通常基于密钥、随机数、时间戳等计算出来。    
算出session_id后，服务器要把session_id发给浏览器，即通过set-Cookie头写到cookie中。 
在服务器这端，也要存session_id来记录已登录的用户，一般存储在内存或Redis中。   
#### 验证阶段
当浏览器又发起后续请求，会在请求头的cookie字段中携带session_id。    
服务器拿到session_id，去服务端存储session的地方查询记录。如有记录，则鉴权通过，正常执行业务逻辑；如无记录或记录过期，则鉴权失败。   
### session-cookie实现：express-session
express应用中，可通过express-session库简单实现cookie-session。
#### 代码
```
var express = require('express');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded());
app.use(session({
    secret: 'why',
    resave: true,
    saveUninitialized: false
}));
app.post('/login', (req, res) => {
    if (req.body.userid === 'a' && req.body.pwd === 'why') {
        req.session.userid = req.body.userid;
        res.send('login success');
    } else {
        res.send('login fail');
    }
});
app.get('/getuserid', (req, res) => {
    if (req.session && req.session.userid) {
        res.send(req.session.userid);
    } else {
        res.send('denied');
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy(e => {
        res.send('logout');
    });
});
app.listen(3000)
```
可以看到，express-cookie在浏览器种了一个cookie：
![](http://static.chiyuanyuan.com/DFCBB7EA-3485-4C70-B6CC-E0F471A83942.png)

#### express-session做的工作
从上面的代码可见，通过express-session，我们只要关注中间件的配置和req.session就能方便的控制cookie-session了。

![](http://static.chiyuanyuan.com/6BA147A5-F21C-4CFF-9FAD-605475110F71.png)

express-session主要实现了以下工作：
* 封装了对cookie的读写操作，并提供配置项配置字段、加密方式、过期时间等。
* 封装了对session的存取操作，并提供配置项配置session存储方式（内存/redis）、存储规则等。
* 给req提供了session属性，控制属性的set/get并响应到cookie和session存取上，并给req.session提供了一些方法。

### cookie-session问题
cookie-session解决了HTTP无状态，但仍存在几个问题。
#### 客户端角度
cookie-session要利用客户端的cookie，那么问题来了：
* 客户端类型被局限在浏览器了，在没有cookie的客户端上没法工作。
* 容易到CSRF攻击。
* cookie增加了HTTP请求的体积，而且存在浪费。比如同一个域名下只有几个接口需要鉴权，但cookie会被带到该域名所有的请求中。

#### 服务端角度
在服务端，需要保存session，那么问题来了：
* 增加了服务端开销。无论放在内存还是Redis，服务器的内存压力都会随请求数增加而增长。
* 服务器扩展成本高。如果请求打在负载均衡集群上，集群机器间就必须同步session。针对这个有两个办法：一是让一个客户端固定请求同一台机器，但这增加了负载风险；二是将session存储在额外的机器上，但如果存session的机器挂了，整个集群session都完了。

## token
前面提到cookie-session的问题，主要集中在两个方面：
* 客户端存cookie，限制了客户端的范围
* 服务端存session，增加了服务器开销，限制了服务器的扩展性

token的出现解决了这两方面的问题：
* 客户端存储凭证不限于cookie
* 避免服务端存储

关键点：把session以某种形式存储在凭证中，这样凭证就不仅是一个用户会话的标识了，还包含了会话中的数据。
### token原理
![](http://static.chiyuanyuan.com/4AADE9C7-B530-428F-A497-A9AC157FE954.png)

#### 登录阶段
用户登录，校验账号密码，获得用户信息。然后以会话数据为基础，通常还要混入密钥、时间戳、签名等，计算出一个token字符串。
然后将计算好的token返回给客户端，可能通过set-Cookie，也可能直接作为接口返回。在web的登录场景下，token仍多存在cookie。
客户端收到token后会保存起来，可以是cookie、localstorage或者其他方式。
#### 验证阶段
客户端再次请求需要带上token，可能是cookie，也可以作为调用参数。
服务端对token进行解析，验证token的有效性，并获取其中的数据。

### token实现之一：cookie-session库
express应用中有cookie-session库：https://www.npmjs.com/package/cookie-session。
为什么还叫cookie-session，我的理解是：以Token的方式，利用cookie，实现了用户登录会话效果。
库的解释如下：

> A user session can be stored in two main ways with cookies: on the server or on the client. This module stores the session data on the client within a cookie, while a module like express-session stores only a session identifier on the client within a cookie and stores the session data on the server, typically in a database.

> 借助cookie，用户会话有两种存储方式：服务端或客户端。本模块把会话数据用cookie存在客户端，而类似“express-session”的模块只在cookie中保存会话标识并将会话数据存在服务端。


#### 代码
引入和配置：
```
const cookieSession = require('cookie-session’);
app.use(cookieSession({
    name: 'token',
    keys: ['why’],
    signed: false
}));
```
cookie-session用法与express-session保持着高度的相似性，也通过req.session存取会话数据：
```
req.session.userid = req.body.userid;
```
cookie-session在浏览器种了cookie：

![](http://static.chiyuanyuan.com/578DAE84-1B28-4A5B-9C61-209F3638D558.png)

#### 编解码
![](http://static.chiyuanyuan.com/8E03B580-1918-4D5A-B263-28360D65EC5A.png)

cookie-session封装了cookie和req.session间存取的编解码过程，其实就是base64：    
```
比如cookie值：eyJ1c2VyaWQiOiJhIn0=，base64解码后就是JSON：{"userid":"abb”}。
```
#### 防篡改
如果把signed配置为true，就多一个.sig cookie，签名防篡改。这个是由依赖模块实现的：[https://github.com/crypto-utils/keygrip](https://github.com/crypto-utils/keygrip)  
这个.sig的值固定长度27位，是token值经过带密钥（key）哈希（SHA1算法）后获得的。
### token实现之二：JWT
#### 概念
JSON Web Tokens，简称JWT，是签发/验证Token的一个标准。JWT生成的token具备固定格式和可验证能力。
#### JWT组成
一个JWT签发的token实例如下：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiJhIiwiaWF0IjoxNTUxOTUxOTk4fQ.2jf3kl_uKWRkwjOP6uQRJFqMlwSABcgqqcJofFH5XCo
```
其中通过“.”分割为三个部分：
* header
* payload
* sigrature

##### header
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```
解码后
```
{"alg":"HS256","typ":"JWT"}
```
是一个JSON对象，记录JWT的一些元数据。alg是一个必须参数，表示加密算法。
##### payload
```
eyJ1c2VyaWQiOiJhIiwiaWF0IjoxNTUxOTUxOTk4fQ
```
解码后
```
{"userid":"a","iat":1551951998}
```
也是一个JSON对象，其中一部分是JWT自身的信息，可能包括：
* iss：Issuer，发行者
* sub：Subject，主题
* aud：Audience，观众
* exp：Expiration time，过期时间
* nbf：Not before
* iat：Issued at，发行时间
* jti：JWT ID

另一部分是自定义的数据，比如这里的userid。

##### signature
```
2jf3kl_uKWRkwjOP6uQRJFqMlwSABcgqqcJofFH5XCo
```

解码后是乱码，这部分是给钱两部分的签名，具体算法如下：
```
const encodedString = base64UrlEncode(header) + "." + base64UrlEncode(payload); 
HMACSHA256(encodedString, 'why');
```
其中“why”为密钥，由服务端自己约定和记录。

#### JWT签发
这个jsonwebtoken库实现了jwt：[https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
```
const jwt = require('jsonwebtoken')
const payload = {
  userid: ‘a'
}
const secret = ‘why'
const token = jwt.sign(payload, secret, { expiresIn: '1day' })
console.log(token)
```

#### JWT验证
```
jwt.verify(token, ‘why', (error, decoded) => {
  if (error) {
    console.log(error.message)
    return
  }
  console.log(decoded)
})
```

#### express-jwt
在express下，还可以用这个：[https://www.npmjs.com/package/express-jwt](https://www.npmjs.com/package/express-jwt)
```
var jwt = require('express-jwt');
 
app.use(jwt({
    secret: 'why’
}));
```

jwt的payload会被挂在req.user上
### Token过期和Refresh Token
#### Token过期
相比session-cookie，token包含的信息更多，一个过期时间就更加必要。token过期后，需要重新获取授权。考虑两种场景：
* 如果只是简单的维持登录状态，可以给token一个相对长的过期时间，过期后用户重新登录。
* 如果token用来访问某些敏感资源，过期时间就必须较短，反复授权体验会很差。
针对第二个情况，一种解决方案就是提供refresh token。

#### Refresh Token
Refresh Token是用来获取Token的，把用户鉴权和敏感资源鉴权分开。如下盗图：

![](http://static.chiyuanyuan.com/CAC63143-5E71-4003-8C28-0478A2B69283.png)

客户端认证用户后，会获得一个Refresh Token，只包含用户相关信息，只有获取Token的权限，所以过期时间较长。

通过Refresh Token去获取访问资源的Access Token，权限较重，过期时间较短。

当Access Token过期，只要通过Refresh Token重新获取。
### 和cookie-session相比
#### 客户端
* 客户端适用范围更广
* 鉴权参数存储、传递的方式更丰富
* 可以避免CSRF
* 【但】鉴权字符串会变大

#### 服务端
* 免存储，解放了服务器存储和扩展能力
* 【但】增加了每次请求的运算压力（时间换空间）
