
---
tag: Cross-Platform
---

# 0 项目概述
## 背景
Flutter是2018年新兴的跨端应用开发框架，基于智慧课堂移动端产品原型，开发Flutter demo，扩展移动APP开发能力。
## 实现效果
![8c1985a5a6ce029961d24f0344c597fb.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p722)



# 1 认识Flutter
## 跨端技术对比

技术类型 | UI渲染方式 | 性能 | 开发效率 | 动态化 | 框架代表
-- | -- | -- | -- | -- | --
H5+原生 | WebView渲染 | 一般 | 高 | ✔️ | Cordova、Ionic
JavaScript+原生渲染 | 原生控件渲染 | 好 | 高 | ✔️ | RN、Weex
自绘UI+原生 | 调用系统API渲染 | 好 | Flutter高, QT低 | 默认不支持 | QT、Flutter

### H5+原生
称h5+原生的开发模式为混合开发 ，采用混合模式开发的APP我们称之为混合应用或Hybrid APP ，如果一个应用的大多数功能都是H5实现的话，我们称其为Web APP。

![image](https://user-images.githubusercontent.com/14797054/51163095-8892d100-18d3-11e9-9597-c4fee6371040.png)

* H5：正常的前端web页面开发，生成的是DOM树，通过JsBridge提供的API调用系统功能。
* JsBridge：混合框架一般都会在原生代码中预先实现一些访问系统能力的API， 然后暴露给WebView以供JavaScript调用。
* WebView：H5页面的容器，同时能连接原生功能给JsBridge接。

### JavaScript+原生渲染

![image](https://user-images.githubusercontent.com/14797054/51163101-9183a280-18d3-11e9-95a0-79192d5b4577.png)

与混合开发最大的区别就是：混合开发JS生成的仍是DOM，只是给它一个容器；而JS原生渲染产出的则是原生组件树。

* JS：主要有RN、Weex两种代表，差在语法风格上。JS部分生成虚拟DOM，传递给JSCore。
* JSCore：把虚拟DOM编译成原生组件树

### 自绘UI+原生

![image](https://user-images.githubusercontent.com/14797054/51163107-98aab080-18d3-11e9-910c-a0290f1edd22.png)

自绘UI+原生更接近原生开发风格，不同的是统一了开发语言，并通过编译引擎生成两套原生机器码。

## Flutter/Dart特点
* 跨平台自绘引擎：Skia作为其2D渲染引擎
* 高性能：相比JS的优势
    * Dart在 JIT（即时编译）模式下，速度与 JavaScript基本持平。但是 Dart支持 AOT，当以 AOT模式运行时，JavaScript便远远追不上了。
    * Flutter使用自己的渲染引擎来绘制UI，布局数据等由Dart语言直接控制，所以在布局过程中不需要像RN那样要在JavaScript和Native之间通信，这在一些滑动和拖动的场景下具有明显优势，因为在滑动和拖动过程往往都会引起布局发生变化，所以JavaScript需要和Native之间不停的同步布局信息，这和在浏览器中要JavaScript频繁操作DOM所带来的问题是相同的，都会带来比较可观的性能开销。
* 运行时和编译器支持两种模式
    * 开发JIT：Flutter在开发阶段采用，采用JIT模式，这样就避免了每次改动都要进行编译
    * 发布AOT：Flutter在发布时可以通过AOT生成高效的ARM代码以保证应用性能
* 类型安全，支持静态类型检测

## Flutter架构

![image](https://user-images.githubusercontent.com/14797054/51163140-aeb87100-18d3-11e9-8e13-8695dea02eaa.png)


### Flutter Framework
纯Dart实现的SDK基础库：

* Fondation、Animation、Painting、Gestures：底层UI库，即dart:ui包。可以对应理解为web中的window对象，提供动画、绘制、手势基础API。
* Rendering：基于底层UI实现的布局层，可以理解为React，是Flutter核心。
    * 维护一个UI树（类似React虚拟DOM）
    * 当UI树变化，计算出变化的部分，更新UI树（类似React diff）
    * 响应元素位置、大小的定义和变换，调用底层UI绘制元素（类似React DOM）
* Widget：定义了一些基础组件，其实相当于html元素、小程序标签、React的JSX。我们写Flutter基本就在调这层东西。
* Material、Cupertino：在Widget基础上提供的视觉组件库，相当于Antd、ElementUI。

### Flutter Engine
纯C++实现的 SDK，其中包括了 Skia引擎、Dart运行时、文字排版引擎等。在代码调用 dart:ui库时，调用最终会走到Engine层，然后实现真正的绘制逻辑。


# 2 Dart语法入门
> Dart是Flutter唯一开发语言，集合了Java和Javascript的语法风格

## 变量与函数

Dart是一种强类型语言，但又保持对js开发者足够友好，所以声明Dart变量有很多种方式。

### 声明
针对两个问题，不同声明方式的限制不同：
1、变量的值在何时确定，能否改变
2、变量的类型能否改变

![图片](http://agroup-bos.cdn.bcebos.com/18ca4753d679c08ef323e8517c18469b00de74ee)
说明：
* 声明格式：关键词 类型（可选） 变量名，`final List<Widget> children;`如果没给类型，自动进行类型推断
* 这里的dynamic和Object完全一样，因为Dart的一切变量都是Object

### 类型
* num
    * int
    * double
* String
* bool
* list
* map
* runes

### 函数
```
bool isNoble(int atomicNumber) {}    // 带类型
bool isNoble （int atomicNumber ）=> _nobleGases [ atomicNumber ] ！= null ;    // 支持箭头函数
String say(String from, String msg, [String device]) {}    // []可选参数
```

## 逻辑

### 运算符
![图片](http://agroup-bos.cdn.bcebos.com/978d2c541b35ed627b32d4573c0e28416d230bee)

### 逻辑语句
* 分支
    * if else
    * switch case
* 循环
    * for
    * for in
    * foreach
    * break
    * continue
* 异常
    * throw
    * try catch finally

## 异步

### Future：（相当于Promise）
```
// 相当于new Promise
Future.delayed(new Duration(seconds: 2),(){
   throw AssertionError("Error");
}).then((data){            // 相当于then
   print(data);
}).catchError((e){            // 相当于catch
   print(e);
}).whenComplete((){            // 相当于finally
});

// 相当于Promise.all
Future.wait([
  Future.delayed(new Duration(seconds: 2), () {
    return "hello";
  }),
  Future.delayed(new Duration(seconds: 4), () {
    return " world";
  })
]).then((results){
  print(results[0]+results[1]);
}).catchError((e){
  print(e);
});
```

### Async/await
和JS用法完全一样

### Stream
Promise的决议是不可逆的，一旦Resolve或者Reject了，就不会再改变状态。
即使是Promise.all或Promise.race也只决议一次。
Stream能像all/race一样包裹多个Futrue，不同的是每次Future返回都能触发Stream的状态，更像一个事件派发/收集者。
```
Stream.fromFutures([
  Future.delayed(new Duration(seconds: 1), () {
    return "hello 1";
  }),
  Future.delayed(new Duration(seconds: 2),(){
    throw AssertionError("Error");
  }),
  Future.delayed(new Duration(seconds: 3), () {
    return "hello 3";
  })
]).listen((data){
   print(data);
}, onError: (e){
   print(e.message);
},onDone: (){
});
```

# 3 从智慧课堂Flutter入手
> 从智慧课堂Flutter入手，熟悉Dart语言，了解模块化、包管理、路由、HTTP

## Flutter智慧课堂实例

### 入口
```
/**
 * @file main.dart
 * @description 应用入口
 */

// 引入包（material UI库）
import 'package:flutter/material.dart';

import './pages/home.dart' as Home;
import './pages/books.dart' as Book;

// 应用入口
void main() => runApp(MyApp());

// MyApp：根组件，继承StatelessWidget组件
class MyApp extends StatelessWidget {
  @override
  // build方法：Flutter组件必须返回一个build方法，描述该组件如何渲染，通常返回对其他组件的组合，相当于React render方法
  Widget build(BuildContext context) {
    // MaterialApp：material.dart引进来的，初始化App容器
    // Dart的组件调用写法：组件名(属性: 值)的方式，相当于JSX中<组件名 属性={值} />
    return MaterialApp(
      title: '百度智慧课堂',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      // home：配置主页面组件
      home: Home.Page(),
      // 命名路由
      routes: {
        'home': (context) => Home.Page(),
        'book': (context) => Book.Page()
      },
    );
  }
}
```

### 组件调用
Flutter用
`组件名(属性: 值)`
的方式调组件构造函数

在Flutter中，一切都是组件叠起来的，包括样式，所以类CSS的样式属性定义也是这么实现的，比如：
![e26ab28ce901e3d5fc1e9fa684ec0ba5.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p724)


### StatelessWidget & StatefulWidget
Flutter把组件基类分为无状态组件和有状态组件，就像React中的一样。
#### StatelessWidget：无状态组件
主页home.dart就是一个无状态组件：
![d9d9a45ef214edb0549e054e13ed3772.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p723)


StatelessWidget直接定义build函数。

![image](https://user-images.githubusercontent.com/14797054/51301891-a98e2a00-1a6b-11e9-8912-f30c020e98b7.png)


#### StatefulWidget：有状态组件
StatefulWidget不仅需要定义build，还需要创建State，但State是以类的形式存在的，而build需要state。

![image](https://user-images.githubusercontent.com/14797054/51301902-b27efb80-1a6b-11e9-9026-e65859943e49.png)


所以习惯上，StatefulWidget只负责实现构造函数和createState方法定义，state定义和build放到state类实例中。



## 模块化和包管理

### 模块化
前面可以看到，Dart以ES6一致的import方式引入依赖包。我们同样可以以这种方式引入自己的模块。

```
import '../widgets/common/layout.dart';
```

但Dart中没有export，也就是说，在layout.dart中定义的所有class都可以在main.dart中引用到。

这样模块多了难免造成命名冲突，所以Dart也支持这样：

![cfac143598a381574b7ce4d23789e45c.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p726)


还可以导入部分

```
// 只导入 Layout
import '../widgets/common/layout.dart’ show Layout;
```

```
// 导入Layout外其他包
import '../widgets/common/layout.dart’ hide Layout;
```
### pubspec.yaml
Flutter有一个类似package.json的文件：pubspec.yaml，记录项目信息及依赖包。
![2ceea2ca5c70fbc520b5d01f6498b49d.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p727)



### 包仓库
Pub（https://pub.dartlang.org/ ）是Google官方的Dart Packages仓库，类似于node中的npm仓库。
区别在于，Pub不支持install+save的方式，而是需要手动在pubspec里添加依赖，并通过flutter命令或IDE安装。

比如我们需要一个http请求包
1、去Pub找到这个：

![image](https://user-images.githubusercontent.com/14797054/51301936-c88cbc00-1a6b-11e9-9d4f-110db05827df.png)


2、在pubspec中添加依赖

![image](https://user-images.githubusercontent.com/14797054/51301953-d2aeba80-1a6b-11e9-9283-bbdbe04a419f.png)

3、由于flutter正在run，可以看到VScode自动执行了get安装依赖包：

![image](https://user-images.githubusercontent.com/14797054/51301962-d9d5c880-1a6b-11e9-94df-046ec3096130.png)

也可以手动执行

```
flutter packages get
```

## 路由
> 路由(Route)在移动开发中通常指页面（Page），这跟web开发中单页应用的Route概念意义是相同的，Route在Android中通常指一个Activity，在iOS中指一个ViewController。所谓路由管理，就是管理页面之间如何跳转，通常也可被称为导航管理。这和原生开发类似，无论是Android还是iOS，导航管理都会维护一个路由栈，路由入栈(push)操作对应打开一个新页面，路由出栈(pop)操作对应页面关闭操作，而路由管理主要是指如何来管理路由栈。


### 路由示例
我们在home里加一个链接，onPress绑定到_gotoPage2方法上，方法代码如下：

```
void _gotoBook() {
    MaterialPageRoute route = MaterialPageRoute(
        builder: (context) => Book.Page()
    );
    Navigator.push(context, route);
}
```

这样，当我们点击主页的链接，就会跳转到备课资料库:
![259b9c0fc6168a774f4a5f7b899f9451.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p729)


### MaterialPageRoute
这是一个路由类，在Material UI库中，继承了基础的PageRoute。

最主要的参数就是builder，传入一个回调函数，返回Route实例中展现的组件。

### Navigator
路由管理组件，提供接口管理路由状态。

* push：传入context和PageRoute实例，将路由入栈以跳转到路由上
* pop：传入context，最近路由出栈，实现一个goBack

### 命名路由表
写过小程序的可能熟悉这样一个操作，就是页面都在app入口注册才能跳转。

Flutter也提供这样的机制，不过不是限制路由可用性，而是给路由命名。

Flutter注册路由的位置在MaterialApp中：

![bf99e4babcc8fcd94cd85df01facf212.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p730)


这样在跳转路由时只要：
![5d75398a7b975717bec555592979961d.png](evernotecid://35F614F3-51E7-44D8-826E-275776B5F114/appyinxiangcom/3664339/ENResource/p731)



这样做的好处很明显，一是给了路由一个统一的管理入口，二是减少了路由跳转的逻辑。
但是，这种路由只在App启动时初始化一次，后面没有任何机会添加参数。

## HTTP请求

### http库请求和JSON编解码
```
import 'dart:convert';
import 'package:http/http.dart' as http;

...
http.get('https://easy-mock.com/mock/5bfe010f7baf9b6a9fa6e8c1/tsdudy/getdocument').then((res) {
      try {
        var data = JSON.decode(res.body);
        var d = data['data']['list'];
        setState(() {
          bookList = d;
        });
        print(bookList);
      } catch (e) {
        setState(() {
          bookList = [];
        });
      }
    });
...

```

# 4 组件选择（遵循web开发习惯）
> Flutter一切皆用组件实现，元素本身、布局，甚至一句CSS的事都需要组件嵌套。在web中得心应手的实现方式在Flutter很别扭，这里总结下对应的实现方式

## 综述

### 一切皆组件
 Flutter一切皆用组件实现，元素本身、布局，甚至一句CSS、一个CSS的值事都需要组件解决。在web中得心应手的实现方式在Flutter很别扭，这里总结下对应的实现方式

### 组件分类
1、构造函数，通常是个实际组件
```
Text('进入')
```
2、对象，通常携带一堆预设值或者生成某种类型值的函数
```
Colors.white
Color.fromRGBO(27, 178, 121, 1)
```


## 布局

### Colum：纵向流
web中我们习惯把元素逐个码出来自然向下排布，在Flutter中，我们需要一个纵向布局组件
```
Column(
    children: <Widget>[]
)
```
在children里才能加入多个widget向下排布。

### SingleChildScrollView：滚动
如果内容很多，超出屏幕范围呢？web中不需要考虑这个问题，但在Flutter会报错

所以需要一个支持滚动的容器，注意它只有一个child，所以往往要套Colum用
```
SingleChildScrollView(
    child: <Widget>,
)
```

### Row：带横向Flex布局的块状元素
web中，如果需要横向布局多个元素，往往通过div，结合float、flex、inline-block等，Flutter中通过Row实现：
```
Row(
    children: <Widget>[
        Expanded(
            child: Text('$selectorText'),
        ),
    ],
)
```
这里有个Expanded，意思就是flex-grow: 1

### Container：盒模型
web元素都是盒模型，可以配padding、margin、border。在Flutter中，大部分组件没这个，需要套一层专门模拟盒模型的组件
```
Container(
    padding: EdgeInsets.only(top: 12, bottom: 12, left: 70, right: 70),
    height: 270,
    child: <Widget>,
)
```
这里连padding值都是个组件EdgeInsets。

### Center：居中
web居中方式多种多样，flex、margin auto、text-align……Flutter通过Center实现居中：
```
Center(
    child: <Widget>,
)
```



## 元素&样式

### Text：p、span、h
```
Text('啊啊啊啊啊', style: TextStyle(
    fontWeight: FontWeight.bold,
    color: Colors.white,
    fontSize: 20
),)
```
TextStyle：Text组件的样式组件。
FontWeight：font-weight预设值组件。
Colors：一个有很多预设颜色的组件。

### Image：img
```
Image.network('https://wkstatic.bdimg.com/8ff3891.png')
```

### RaisedButton / IconButton：button
```
RaisedButton(
    child: Text('进入'),
    color: Color.fromRGBO(27, 178, 121, 1),
    padding: EdgeInsets.only(top: 12, bottom: 12, left: 70, right: 70),
    onPressed: () {
        Navigator.pushNamed(context, 'home');
    },
)
```
Color：另外一个做颜色的组件，主要是RGB的自定义色号。
EdgeInsets：内侧布局（padding）样式组件，有多种方法定padding。
不是所有的组件都能Press，只有Button之类的有Press事件。

### FlatButton：a

    FlatButton(
                                child: Container(
                                  width: 1000,
                                  padding: EdgeInsets.only(left: 30),
                                  child: Text(unit['children'][i]),
                                ),
                                onPressed: () {
                                  setState(() {
                                    lessonSelected = unit['children'][i];
                                    lessonOpen = false;
                                    _listBook();
                                  });
                                },
                              ),

### Icon：图标
```
Icon(Icons.arrow_drop_up)
```

Icons是Flutter的图标库


# 5 组件语法（对照React）
## 综述

总体来说，Dart语法对js开发者还是很友好的。本文在模版语法上，做一个React和Dart对照。

## 生命周期
- initState : 相当于componentDidMount。初始化widget的时候调用，只会调用一次。 
- build : 相当于render。初始化之后开始绘制界面，当setState触发的时候会再次被调用 
- didUpdateWidget : 相当于componentWillUpdate，当触发setState时，会被调用 
- dispose : 相当于componentWillUnmount，页面销毁的时候调用

如图，在build中返回组件实例，在initState请求接口获取数据
![图片](http://agroup-bos.cdn.bcebos.com/f4a1e9bb1bfec318c8ba2c5cde6ded8ecf5e418d)
## state管理

在React组件中，我们维护一组state，通过改变state映射视图变化。Flutter的StatefulWidget也提供类似能力。

首先声明一个StatefulWidget并绑定state。
```
class Page extends StatefulWidget {
    _PageState createState() => _PageState();
}

class _PageState extends State<Page> {
    bool selectorOpen = false;
    void _listBooks() {}
    @override
    Widget build(BuildContext context) {}
}
```

### state初始化
定义state及初始赋值。

React写法
```
class Page extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectorOpen: false;
        };
    }
}
```

Flutter写法
```
class _PageState extends State<Page> {
    bool selectorOpen = false;
}
```

React需要在组件构造函数中定义object类型的state属性，并把一个state作为key。Flutter直接定义到组件对应的State类属性上。

### setState
更新state，映射视图变化。这里Flutter底层做了一套类似React diff的优化。

React写法
```
this.setState({
    selectorOpen: true
});
```

Flutter
```
setState(() {
    selectorOpen = true;
});
```

React以key-value的形式更新state，Flutter用更直观的赋值操作，包裹在setState方法内。



## 模版逻辑语法

### 获取state值
比如把state值作为string输出。

React
```
<p>教材: {this.state.selectorOpen}</p>
// 或者
<p>{`教材: ${this.state.selectorOpen}`}</p>
```

Flutter
```
Text('教材: $selectorText')
```

### if

React：JSX中我们习惯用&&或者三目运算做if
```
selectorOpen && <p>这是内容</p>

selectorOpen ? <p>这是内容</p> : ''
```

Flutter：由于Dart是强类型的，不存在&&这种hack用法
```
selectorOpen ？Text('学段’) : Text('')
```


### map

React
```
list.map(item => <p>{item}</p>)
```

Flutter
```
list.map((item) => Text(item)).toList()
```

map用法几乎完全一致，注意最后要toList一下，不然类型不对。










