# react-mhoc

React高阶组件

1. style-useable.js

`componentWillMount` 触发 `style.use`  
`componentWillUnmount` 触发 `style.unuse`

```jsx
import {styleUseable} from 'react-mhoc'
import style from './style.use.less'

@styleUseable(style)
class MyComponent extends React.Component {
    // ....
}
```

2. editable.js

可同步编辑props/state/...内部数据
![](http://obu9je6ng.bkt.clouddn.com/FkVW1A_OJ5Nw5m2wNFQL5QrtIGfF?imageslim)

[Demo](https://m-cuttlefish.github.io/react-mhoc/page/)

- 参数
    - groupName: string  
        编辑视图的组名(默认为组件名)
    - attrNames: Array  
        需要编辑的数据keyNames, props强制支持 (默认['state'])

```jsx
import {editable} from 'react-mhoc'

@editable
class MyComponent extends React.Component {
    // ....

    // ref Api
    open() {}
}


class App extends React.Component {

    componentDidMount() {
        // not existed open
        // this.ref.open()

        // ok
        this.ref.comp.open()
    }

    render() {
        <MyComponent ref={r => this.ref = r} />
    }
}
```


## ChangeLog

- 1.2.1 
    1. 支持Array/Object的新增和删除
    2. 代码简单重构