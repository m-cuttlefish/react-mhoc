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

    Object.defineProperty(this, 'unuse', {
        enumerable: false,
        writable: false,
        value: 'aaa'
    })
}

global.person = new Person()

class State {
    @observable foo = {a: 234}

    notob = {a: 234}

    @observable bar = 'bar'

    init() {
        this.foo = {a: ['I\'m', 'Initialized'], o: {x: 'xx'}}
        this.bar = 'bbbbar'
    }
}

@editable({
    attrNames: ['local', 'state'],
    groupName: 'MobxTest'
})
@observer
class MobxTest extends React.Component {
    state = {
        mobx: new State()
    }
    local = this.state

    componentWillMount() {
        this.state.mobx.init()
    }

    render() {
        return (
            <div>
                <h1>MobxTest</h1>
                <pre>
                    foo: {stringify(this.state.mobx.foo)}
                </pre>
                <pre>
                    bar: {stringify(this.state.mobx.bar)}
                </pre>
                <div>{this.props.children}</div>
            </div>
        )
    }
}

class Container extends React.Component {

    componentDidMount() {
        // setTimeout(() => {
        //     this.setState({
        //         hide: true
        //     })
        // }, 10000)
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
                    obj={{}}
                />
                <EnhancedExampleB
                    max={50}
                />
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

