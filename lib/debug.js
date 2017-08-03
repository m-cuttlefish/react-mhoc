import React from 'react'
import ReactDOM from 'react-dom'
import c from 'classname'

function replacerFactory(opt) {
    function replacer(key, value) {
        console.log('key:', key)
        console.log('value:', value)
        console.log('Type:', value.constructor.name)
        console.log('')

        if (typeof value === 'function') {
            if (opt.functionDetail) {
                return value.toString()
            } else {
                return `function ${value.name}() {...}`
            }
        } else if (value.constructor) {
            var nativeClassList = [
                Object, String, Date, RegExp
            ]

            var Class = value.constructor
            if (nativeClassList.indexOf(Class) >= 0) {
                // if (Class === Object) {
                if (typeof value.toJSON === 'function') {
                    return `new ${Class.name}(${value.toJSON()})`
                }
                return value
                // }
                // return stringify(value, opt)
            } else {
                // class object
                return `new ${Class.name}(...)`
            }
        }
        return value
    }

    return replacer
}



export function stringify(value, opt) {
    return JSON.stringify(value, replacerFactory(opt), 2)
}

function propsStateDebug(WrappedComponent, options = {}) {
    var StateDebugComponent = attrDebug(WrappedComponent, options)
    class PropsComponent extends React.Component {
        constructor(props) {
            super(props)
        }

        local = { ...this.props }
        // state = {...this.props}

        render() {
            const {
                children,
                ...props,
            } = this.local

            return (
                <div>
                    <h4>Teest</h4>
                    <StateDebugComponent {...props}>
                        {children}
                    </StateDebugComponent>
                </div>
            )
        }
    }

    // return WrappedComponent
    return attrDebug(PropsComponent, {
        ...options,
        attrName: 'local'
    })
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
                    {JSON.stringify(this.props, null, 2)}
                </pre>
                <p>
                    State:
                </p>
                <pre>
                    {JSON.stringify(this.state, null, 2)}
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



ReactDOM.render(
    <EnhancedExample
        customInstance={<EnhancedExample />}
        Person={Person}
        person={new Person('moyu', 20)}
        object={{
            str: 'value',
            func: alert,
            instance: new Example()
        }}
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

