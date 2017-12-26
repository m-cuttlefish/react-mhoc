import React from 'react'
import ReactDOM from 'react-dom'
import hoistNonReactStatic from 'hoist-non-react-statics';

import attrEditable from './attrEditable'
import {stringify, getDisplayName} from './helper'
import isElementOfType from './helper/isElementOfType'

const reactCreateElement = React.createElement

function origin(WrappedComponent, options = {}) {
    const {
        attrNames = ['state'],
        groupName = getDisplayName(WrappedComponent),
        withProps = true,
        ...attrOptions
    } = options

    let WrapComponent = attrNames.reduce((WrappedComponent, name, index, all) => {
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
            this.setState({...this.origin.props});

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
                    ref={ref => this.origin = ref}
                >
                    {children}
                </WrapComponent>
            )
        }
    }
    hoistNonReactStatic(PropsComponent, WrappedComponent);

    let ResultComponent = WrapComponent
    if (withProps) {
        ResultComponent = attrEditable({
            ...attrOptions,
            groupName,
            hideViewBtn: !!attrNames.length,
            attrName: 'state',
            attrTitle: 'Props'
        })(PropsComponent)

        const originalPropTypes = ResultComponent.PropTypes
        ResultComponent.PropTypes = void 0
        const originCreateElement = React.createElement
        React.createElement = reactCreateElement
        const propsComponentType = (<ResultComponent/>).type
        ResultComponent.PropTypes = originalPropTypes
        React.createElement = originCreateElement

        const createElement = React.createElement
        React.createElement = function (name, props, ...children) {
            const element = createElement.apply(this, arguments)
            if (propsComponentType === element.type && !(element instanceof Proxy)) {
                const proxy = new Proxy(element, {
                    get(ref, name) {
                        if (ref[name] !== 'undefined') {
                            return ref[name]
                        }
                        return ref.origin[name]
                    }
                })
                debugger
                return proxy
            }
            return element
        }
    }

    return ResultComponent;
}

export default function editable(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return origin(classOrOpt)
    } else {
        return WrappedComponent => origin(WrappedComponent, classOrOpt)
    }
}

