import React from 'react'
import ReactDOM from 'react-dom'

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


function renderEditableData(data) {



}


function debugOrigin(WrappedComponent, options = {}) {
    let functionDetail = 'functionDetail' in options ? options.functionDetail : false
    let infoDown = 'infoDown' in options ? options.infoDown : false
    return class DebugComponent extends WrappedComponent {

        render() {

            let renderInfo = () => {
                return (
                    <div style={{padding: '5px', border: '1px solid #ddd', borderRadius: 5}}>
                        <h4>
                            HOC Debugger Component
                        </h4>
                        {!infoDown ? renderProps() : renderState()}
                        {!infoDown ? renderState() : renderProps()}
                    </div>
                )
            }

            let renderProps = () => {
                return (
                    <div>
                        <p>
                            Props
                        </p>
                        <pre>{stringify(this.props, {functionDetail})}</pre>
                    </div>
                )
            }

            let renderState = () => {
                return (
                    <div>
                        <p>
                            State
                        </p>
                        <pre>{stringify(this.state, {functionDetail})}</pre>
                    </div>
                )
            }


            return (
                <div>
                    {!infoDown && renderInfo()}
                    {super.render()}
                    {infoDown && renderInfo()}
                </div>
            )
        }
    }
}

export default function debug(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return debugOrigin(classOrOpt)
    } else {
        return WrappedComponent => debugOrigin(WrappedComponent, classOrOpt)
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
                    Wrapped Component
                </h2>
                <p>Im a wrapped component</p>
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

ReactDOM.render(
    <EnhancedExample
        customInstance={new Example()}
        object={{
            str: 'value',
            func: alert,
            instance: new Example()
        }}
        date={new Date()}
        string={'I\'m String'}
        callback={function test() {
            alert(222)
        }}
    />,
    document.getElementById('root')
)

