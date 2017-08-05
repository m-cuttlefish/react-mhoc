import React from 'react'
import ReactDOM from 'react-dom'
import {Histogram} from 'react-mchart'
import 'react-mchart/css/style.css'

import {
    observable
} from 'mobx'
import {
    observer
} from 'mobx-react'

import editable from '../lib/editable'
import {stringify} from '../lib/helper'


const EnhancedExampleA = editable({
    groupName: 'Histogram'
})(Histogram)

const EnhancedExampleB = editable({
    attrNames: ['state'], groupName: 'groupB'
})(Histogram)


function Person(a, b) {
    this.name = a;
    this.age = b;
}

class State {
    @observable foo = {a: 234}
    @observable bar = "bar"
}

@editable({
    attrNames: ['local'],
    groupName: 'MobxTest'
})
@observer
class MobxTest extends React.Component {
    local = new State

    render() {
        return (
            <div>
                <h1>MobxTest</h1>
                <pre>{stringify(this.local)}</pre>
                <div>{this.props.children}</div>
            </div>
        )
    }
}

class Container extends React.Component {

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                hide: true
            })
        }, 2000)
    }

    state = {hide: false}

    render() {
        return (
            <div>
                <EnhancedExampleA
                    b={true}
                    person={new Person('my', 19)}
                    Person={Person}
                    Ele={EnhancedExampleA}
                    ele={<EnhancedExampleA/>}
                />
                <EnhancedExampleB />
                {!this.state.hide && <EnhancedExampleB />}
                <MobxTest />
            </div>
        )
    }
}

ReactDOM.render(
    <Container/>,
    document.getElementById('root')
)

