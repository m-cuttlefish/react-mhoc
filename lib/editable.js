import React from 'react'
import ReactDOM from 'react-dom'


import attrEditable from './attrEditable'
import {stringify} from './helper'

function origin(WrappedComponent, options = {}) {
    const {
        attrNames = ['state'],
        groupName = WrappedComponent.name,
        ...attrOptions
    } = options

    var WrapComponent = attrNames.reduce((WrappedComponent, name, index) => {
        return attrEditable({
            groupName,
            ...attrOptions,
            attrName: name
        })(WrappedComponent)
    }, WrappedComponent)


    class PropsComponent extends React.Component {

        state = { ...this.props }

        componentDidMount() {
            // this.state = this.comp.state
            // this.forceUpdate()
            this.setState({...this.comp.props})
        }

        render() {
            const {
                children,
                ...props,
            } = this.state

            return (
                <WrapComponent
                    {...props}
                    ref={ref => this.comp = ref}
                >
                    {children}
                </WrapComponent>
            )
        }
    }

    // return WrappedComponent
    return attrEditable({
        ...attrOptions,
        groupName,
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

