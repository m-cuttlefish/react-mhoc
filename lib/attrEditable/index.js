import React from 'react'
import c from 'classname'
import './style.css'

import Factory, {render, removeContainer, renderComponent} from './Factory'


function attrDebug(Component, options = {}) {
    options.functionDetail = 'functionDetail' in options ? options.functionDetail : false
    options.infoDown = 'infoDown' in options ? options.infoDown : false
    options.attrName = 'attrName' in options ? options.attrName : 'state'
    options.attrTitle = 'attrTitle' in options
                ? options.attrTitle
                : `${options.attrName[0].toUpperCase()}${options.attrName.substr(1)}`


    // let factory;


    let factory = null

    return class extends Component {
        constructor(...args) {
            super(...args)
            factory = new Factory(this, options)
        }

        componentDidMount(...args) {
            super.componentDidMount && super.componentDidMount(...args)
            factory.render()
        }

        componentDidUpdate(...args) {
            super.componentDidUpdate && super.componentDidUpdate(...args)
            // factory.forceUpdate()
            factory.update()
        }

        componentWillUnmount(...args) {
            factory.removeView()
            super.componentWillUnmount && super.componentWillUnmount(...args)
        }

    }

}

export default function attrEditable(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return attrDebug(classOrOpt)
    } else {
        return WrappedComponent => attrDebug(WrappedComponent, classOrOpt)
    }
}