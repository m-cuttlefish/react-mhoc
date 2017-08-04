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

export default function editable(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return propsStateDebug(classOrOpt)
    } else {
        return WrappedComponent => propsStateDebug(WrappedComponent, classOrOpt)
    }
}

