import React from 'react'
import ReactDOM from 'react-dom'


import attrEditable from './attrEditable'
import {stringify} from './helper'

function origin(WrappedComponent, options = {}) {
    const {
        attrNames = ['state'],
        ...attrOptions
    } = options

    var WrapComponent = attrNames.reduce((WrappedComponent, name, index) => {
        return attrEditable({
            ...attrOptions, attrName: name
        })(WrappedComponent)
    }, WrappedComponent)


    class PropsComponent extends React.Component {

        state = { ...this.props }

        componentDidMount() {
            this.setState({...this.comp.props})
        }

        render() {
            const {
                children,
                ...props,
            } = this.state

            return (
                <div>
                    <h1>{WrappedComponent.name}</h1>
                    <WrapComponent
                        {...props}
                        ref={ref => this.comp = ref}
                    >
                        {children}
                    </WrapComponent>
                </div>
            )
        }
    }

    // return WrappedComponent
    return attrEditable({
        ...attrOptions,
        attrName: 'state',
        attrTitle: 'Props'
    })(PropsComponent)
}

export default function editable(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return origin(classOrOpt)
    } else {
        return WrappedComponent => origin(WrappedComponent, classOrOpt)
    }
}

