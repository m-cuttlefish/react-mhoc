import React from 'react'
import ReactDOM from 'react-dom'

function replacer(opt, key, value) {
    if (typeof value === 'function') {
        if (opt.functionDetail) {
            return value.toString()
        } else {
            return `function ${value.name}() {...}`
        }
    }

    return value
}

export function stringify(value, opt) {
    return JSON.stringify(value, replacer.bind(null, opt), 2)
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

/*
 @debug({functionDetail: true, infoDown: true})
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
 </div>
 )
 }
 }

 const EnhancedExample = Example

 ReactDOM.render(<EnhancedExample date={(new Date).toISOString()} callback={function test() {alert(222)}}/>, document.getElementById('root'))
*/
