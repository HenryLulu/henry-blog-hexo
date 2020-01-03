---
tag: React
---

#### 需要优化的场景
在Hooks为主的React项目中，会有大量的组件通过函数声明。多数情况下，我们不需要对函数组件的渲染进行特殊优化，即使有些重复渲染因不会对体验造成太大影响也被忽略了。
但有些情况下优化就显得很必要，比如如下场景：
``` javascript
const DemoLoader = props => {
  const { demoUrl } = props;
  return <div className="demoloader">
    <iframe src={demoUrl} />
  </div>;
};
```
这里声明了一个函数组件，组件很简单，接受`demoUrl props`，并作为`iframe`的`src`渲染出来。如果这里做了不必要的rerender，`iframe`就会重新加载，一方面出现白屏，另一方面对服务器增加了一次请求压力。
#### shouldComponentUpdate
在class组件中，我们可以通过`shouldComponentUpdate`阻止不必要的rerender：
``` javascript
class DemoLoader extends React.Component {

  shouldComponentUpdate(nextProps) {
    return nextProps.demoUrl !== this.props.demoUrl;
  }

  render() {
    const { domoUrl } = this.props;
    return <div className="demoloader">
      <iframe src={demoUrl} />
    </div>;
  }
}
```
但在函数组件中，没有`shouldComponentUpdate`
#### React.memo
为了解决函数组件中的优化问题，React在`16.6`版本增加了`React.memo`。官网文档：[https://reactjs.org/docs/react-api.html#reactmemo](https://reactjs.org/docs/react-api.html#reactmemo)    

> `React.memo`是一个高阶组件，类似于`React.PureComponent`，只不过用于函数组件而非class组件。
> 如果你的函数组件在相同`props`下渲染出相同结果，你可以把它包裹在`React.memo`中来通过缓存渲染结果来实现性能优化。这意味着`React`会跳过组件渲染，而使用上次渲染结果。
``` javascript
const MyComponent = React.memo(function MyComponent(props) {
  /* render using props */
});
```
> `React.memo`默认只会浅比较`props`，如果需要定制比较，你可以给第二个参数传入自定义比较函数
``` javascript
function MyComponent(props) {
  /* render using props */
}
function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
}
export default React.memo(MyComponent, areEqual);
```
> 和class组件中的`shouldComponentUpdate`不同，如果`props`相同则应返回`true`，否则返回`false`。这点二者正好相反。

#### 改写组件
``` javascript
const DemoLoader = React.memo(props => {
  const { demoUrl } = props;
  return <div className="demoloader">
    <iframe src={demoUrl} />
  </div>;
}, (prevProps, nextProps) => {
  return prevProps.demoUrl === nextProps.demoUrl;
});
```