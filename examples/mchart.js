import React from 'react'
import ReactDOM from 'react-dom'
import {Histogram} from 'react-mchart'
import NormalHistogram from './Histogram/Normal'
import TileHistogram from './Histogram/Tile'
import 'react-mchart/css/style.css'

import {
    observable
} from 'mobx'
import {
    observer
} from 'mobx-react'

import editable from '../lib/editable'
import {stringify} from '../lib/helper'


const EditableDefaultHistogram = editable({
    groupName: 'DefaultHistogram '
})(Histogram)

const EditableNormalHistogram = TileHistogram;

const EditableTileHistogram = NormalHistogram;


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
    groupName: 'MobxTest',
    // withProps: false
})
@observer
class MobxTest extends React.Component {
    state = {
        mobx: new State()
    }

    static defaultRef = "defaultRef"

    local = this.state

    componentWillMount() {
        this.state.mobx.init()
    }

    sayHello() {
        console.log(this);
        // alert('Hello!');
    }

    render() {
        // console.log(this.props);
        return (
            <div>
                <h1 ref="h1">MobxTest</h1>
                <pre>
                    foo: {stringify(this.state.mobx.foo)}
                </pre>
                <pre>
                    bar: {stringify(this.state.mobx.bar)}
                </pre>
                <pre>
                    Props: {stringify(this.props)}
                </pre>
                {/* <div>{this.props}</div> */}
            </div>
        )
    }
}

// alert(MobxTest.defaultRef)

@editable({
    groupName: 'Container',
    withProps: false
})
class Container extends React.Component {

    componentDidMount() {
        setInterval(() => {
            this.setState({count: this.state.count + 1})
        }, 1000);
        debugger
        this.refs.his.origin.sayHello();
        this.refs.mobxTest.origin.sayHello();
        // console.log(this.refs.mobxTest.refs.h1);
    }

    state = {count: 1}

    render() {
        // console.log(this.state.count)
        return (
            <div>
                <div>
                    <h3>EditableDefaultHistogram</h3>
                    <EditableDefaultHistogram
                        ref={"his"}
                        testProps={{
                            func: alert,
                            person: new Person('my', 19),
                            Person: Person,
                            EleClass: NormalHistogram,
                            component: <NormalHistogram/>
                        }}
                    />
                </div>
                <div>
                    <h3>EditableNormalHistogram A</h3>
                    <EditableNormalHistogram />
                    <h3>EditableNormalHistogram B</h3>
                    <EditableNormalHistogram />
                </div>
                <div>
                    <h3>EditableTileHistogram</h3>
                    {!this.state.hide && <EditableTileHistogram />}
                </div>
                <MobxTest ref="mobxTest" count={this.state.count}/>
            </div>
        )
    }
}



ReactDOM.render(
    <Container/>,
    document.getElementById('root')
)

