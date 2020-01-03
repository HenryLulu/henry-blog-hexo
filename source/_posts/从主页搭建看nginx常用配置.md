---
tag: Server
---

> 在主页搭建过程中，借助Nginx方便实现静态资源、接口转发、子域名
## nginx是什么？
nginx是个“HTTP服务器和反向代理服务器”。
### HTTP服务器怎么说？
就像你去窗口办事，你说你要办什么，然后递上你的材料，窗口小姐姐一顿操作后给你返回材料。这期间她可能复印了你的材料、在系统里录入你的信息、盖章、填表、点钱，但返回给你的，一定是一个明确的办理结果（给你个证、告诉你材料不够、告诉你今天下班了）。这次办理请求就算完成了。
nginx就像这个窗口小姐姐，它能处理你的HTTP请求，比如把服务器上的静态资源返给你。
### 反向代理怎么说？
有些事，窗口小姐姐办不了。比如你去取个文件，她不能自己起来去找啊，就喊后面小哥找，把你的请求代理给小哥处理，找到文件后，再经她手返给你。这期间，你不用关心小哥是谁，怎么找到的文件，只管拿走文件。这就叫反向代理。
如果有好几个小哥负责找文件，小姐姐会挑一个闲着的，这就是反向代理的一个重要用途：负载均衡。
## 回到项目需求
我的项目是个基于React开发的主页，现在手里有一台ubuntu服务器，想把主页放上去。
### 安装并启动nginx
```
sudo apt-get install nginx
sudo /etc/init.d/nginx start
```
### 需求一：直接访问React编译产出的静态文件
最初的主页就是个静态页面，起一个node服务有点多余了，如何配nginx快速访问React呢？
```
server {
    listen 80;    # nginx监听端口
    server_name _;    # 匹配名
    location / {
        root /root/react/build;   # 静态资源路径
        index index.html;    #index
    }
}
```

* server：http服务器配置
* listen：监听的端口
* server_name：服务器名
* location：匹配请求路径
* root：静态资源目录

配好后，重载配置
sudo nginx -s reload
### 需求二：代理请求
后来想加个功能，就是从github把我的库列表拉过来放到主页里展示。
这里需要github的api，以后细说，总之是个需要身份认证的接口。
如果我直接在前端请求，有两个问题：1是跨域；2是身份认证肯定要暴露了，所以需要请求我自己的服务器，再代理到github api。
这次只关注location，在 / 下面新增一条就好。
```
location / {
    ……
}
location /api/github {
    rewrite ^/api/github/(.*)$ /$1 break;    # 把路由中的/api/github去掉
    proxy_pass https://api.github.com;    # 代理到github api
    proxy_set_header Authorization xxx;    # 添加token header（解除github api调用次数限制）
}
```

* rewrite：重写请求路径
* proxy_pass：代理地址
* proxy_set_header：设置header


## 需求三：子域名
一个主页已经不能满足我的网站了，我想让home.xxx.com指向主页，blog.xxx.com指向另外一个站点。
只需要修改server_name匹配：
```
server_name home.xxx.com;
```
对blog，再新建一个server：
```
server
{
    listen 80;    # nginx监听端口
    server_name blog.xxx.com;
    location / {
    }
}

```