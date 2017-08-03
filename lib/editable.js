import React from 'react'
import ReactDOM from 'react-dom'


import attrEditable from './attrEditable'
import {stringify} from './helper'

function propsStateDebug(WrappedComponent, options = {}) {
    var StateDebugComponent = attrEditable(options)(WrappedComponent)
    class PropsComponent extends React.Component {
        constructor(props) {
            super(props)
        }

        state = { ...this.props }
        // state = {...this.props}

        render() {
            const {
                children,
                ...props,
            } = this.state

            return (
                <div>
                    <StateDebugComponent {...props}>
                        {children}
                    </StateDebugComponent>
                </div>
            )
        }
    }

    // return WrappedComponent
    return attrEditable({
        ...options,
        attrName: 'state',
        attrTitle: 'Props'
    })(PropsComponent)
}

export default function debug(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return propsStateDebug(classOrOpt)
    } else {
        return WrappedComponent => propsStateDebug(WrappedComponent, classOrOpt)
    }
}


class Example extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'fran',
            email: 'franleplant@gmail.com'
        }
    }

    render() {
        return (
            <div>
                <h2>
                    Example Component
                </h2>
                <p>Im a Example component</p>
                <p>
                    Props:
                </p>
                <pre>
                    {stringify(this.props, {})}
                </pre>
                <p>
                    State:
                </p>
                <pre>
                    {stringify(this.state, {})}
                </pre>
            </div>
        )
    }
}

const EnhancedExample = debug({
    functionDetail: true, infoDown: false
})(Example)

function Person(name, age) {
    this.name = name;
    this.age = age
}

var obj = {
    str: 'value',
    num: 0,
    func: alert,
}


ReactDOM.render(
    <EnhancedExample
        customInstance={<EnhancedExample />}
        Person={Person}
        person={new Person('moyu', 20)}
        object={obj}
        boolean={true}
        date={new Date()}
        string={'I\'m String'}
        regexp={/test/}
        callback={function test() {
            alert(222)
        }}
        array={[1, 2, 4]}
    />,
    document.getElementById('root')
)

