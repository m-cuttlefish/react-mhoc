import React from 'react'
import ReactDOM from 'react-dom'
import editable from '../lib/editable'
import {stringify} from '../lib/helper'


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

const EnhancedExample = editable({
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

