import React from 'react'
import c from 'classname'
import hoistNonReactStatic from 'hoist-non-react-statics';

import {getDisplayName} from '../helper';
import Factory, {render, removeContainer} from './Factory'





function attrDebug(Component, options = {}) {
    options.functionDetail = 'functionDetail' in options ? options.functionDetail : false
    options.infoDown = 'infoDown' in options ? options.infoDown : false
    options.attrName = 'attrName' in options ? options.attrName : 'state'
    options.attrTitle = 'attrTitle' in options
                ? options.attrTitle
                : `${options.attrName[0].toUpperCase()}${options.attrName.substr(1)}`
    options.groupName = 'groupName' in options ? options.groupName : getDisplayName(Component)
    options.hideViewBtn = 'hideViewBtn' in options ? options.hideViewBtn : false

    let factory = []

    class AttrEditable extends Component {
        constructor(...args) {
            super(...args)
            // @todo 污染环境？
            this['$attr$editable$$factory$' + options.attrName] = new Factory(this, options)
        }

        componentDidMount(...args) {
            super.componentDidMount && super.componentDidMount(...args)
            this['$attr$editable$$factory$' + options.attrName].render()
        }

        componentDidUpdate(...args) {
            super.componentDidUpdate && super.componentDidUpdate(...args)
            this['$attr$editable$$factory$' + options.attrName].update()
        }

        componentWillUnmount(...args) {
            this['$attr$editable$$factory$' + options.attrName].removeView()
            super.componentWillUnmount && super.componentWillUnmount(...args)
        }

    }

    hoistNonReactStatic(AttrEditable, Component);
    return AttrEditable;
}

export default function attrEditable(classOrOpt) {

    if (typeof classOrOpt === 'function') {
        return attrDebug(classOrOpt)
    } else {
        return WrappedComponent => attrDebug(WrappedComponent, classOrOpt)
    }
}