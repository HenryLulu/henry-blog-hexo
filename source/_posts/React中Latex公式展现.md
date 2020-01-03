---
tag: React
---

## 背景
最近在做一个题库产品，需要把公式展现到前端React中，如下：
![](http://static.chiyuanyuan.com/9ekmbP.jpg)
方案是后端返回Latex格式，前端解析展现，相比用图片，有几点好处：
* 公式清晰
* 可复制
* 减少前端图片资源请求和后端资源存储

## LaTex公式
### 什么是LaTex？
写过论文的应该都知道，LaTex是一套排版语法，通过LaTex编码可以展现复杂的排版格式，包括公式。
### 公式相关语法
#### 示例
一个Latex公式示例如下：
```
\mathrm{y}=\mathrm{lg}\frac{x}{x-2}+\mathit{arcsin}\frac{x}{3}
```
其中\xxx就是LaTex控制字符，{x}是字符参数，比如这里\frac{x}{x-2}表示x为分子，x-2为分母的分数
#### 常见语法
[https://blog.csdn.net/garfielder007/article/details/51646604](https://blog.csdn.net/garfielder007/article/details/51646604)
## MathJax
### 介绍
MathJax是一款运行在浏览器中的开源数学符号渲染引擎，使用MathJax可以方便的在浏览器中显示数学公式，不需要使用图片。目前，MathJax可以解析Latex、MathML和ASCIIMathML的标记语言。
### 使用方法
```
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
<script type="text/javascript"
  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
```
## React下的MathJax
### 直接用MathJax的注意点
React组件是动态的，需要在每次did时都配置下激活，代码变成这样
```
constructor (props) {
  super(props);
  MathJax.Hub.Config({ tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]} });
}
componentDidMount () {
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.querySelector('.challenge__description')]);
}
componentDidUpdate () {
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.querySelector('.challenge__description')]);
}
```
### react-mathjax
一个封装好的react下mathjax组件：[https://www.npmjs.com/package/react-mathjax](https://www.npmjs.com/package/react-mathjax)
```
<MathJax.Provider>
    <div>
 
        <MathJax.Node formula={tex} />
    </div>
</MathJax.Provider>
```
## 基于react-mathjax封装一个组件
### 为什么要封装一层
react-mathjax要求直接向Node传入标准LaTex，但在项目中，LaTex片段是以这种形式插入到返回数据中的：
```
函数$ \\mathrm{y}=\\mathrm{lg}\\frac{x}{x-2}+\\mathit{arcsin}\\frac{x}{3}$ 的定义域是_______。
```
我们需要这样一个组件，即传入夹杂着LaTex的字符串，render一个包含正常文本和MathJax节点的元素。

### Latex语法匹配和替换
这里最关键的是Latex语法匹配和替换，代码如下：
```
const reg = /(\$[^\$]+\$)/g;
let match;
let lastIndex = 0;
let nodes = [];
while (match = reg.exec(str)) {
    if (match.index !== lastIndex) {
        nodes.push(str.slice(lastIndex, match.index));
    }
    nodes.push(<span>
        <MathJax.Node inline formula={str.slice(match.index + 1, match.index + match[0].length - 1)} />
    </span>);
    lastIndex = match.index + match[0].length;
}
if (lastIndex !== str.length) {
    nodes.push(str.slice(lastIndex));
}
return <MathJax.Provider>{nodes}</MathJax.Provider>;
```
### 调用和结果
```
<MathJaxRenderer source={'函数$ \\mathrm{y}=\\mathrm{lg}\\frac{x}{x-2}+\\mathit{arcsin}\\frac{x}{3}$ 的定义域是_______。'} />
```
