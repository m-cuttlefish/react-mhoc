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

    var WrapComponent = attrNames.reduce((WrappedComponent, name, index, all) => {
        return attrEditable({
            ...attrOptions,
            groupName,
            hideViewBtn: index !== 0,
            attrName: name
        })(WrappedComponent)
    }, WrappedComponent)


    class PropsComponent extends React.Component {
        constructor(props) {
            super(props);
        }

        state = { ...this.props }

        componentDidMount() {
            // this.state = this.comp.state
            // this.forceUpdate()
            this.setState({...this.comp.props})
        }

        componentWillReceiveProps(nextProps) {
            if (this.props !== nextProps) {
                this.setState({...nextProps})
            }
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
        hideViewBtn: !!attrNames.length,
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

