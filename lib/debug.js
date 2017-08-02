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
  return class DebugComponent extends WrappedComponent {
      render() {
        return (
          <div>
            <h3>
              HOC Debugger Component
            </h3>
            <p>
              Props
            </p>
            <pre>{stringify(this.props, {functionDetail})}</pre>
            <p>
              State
            </p>
            <pre>{stringify(this.state, {functionDetail})}</pre>
            {super.render()}
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
@debug({functionDetail: true})
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
