import React from 'react'
import c from 'classname'

import Factory from './Factory'


function attrDebug(Component, options = {}) {
    options.functionDetail = 'functionDetail' in options ? options.functionDetail : false
    options.infoDown = 'infoDown' in options ? options.infoDown : false
    options.attrName = 'attrName' in options ? options.attrName : 'state'
    options.attrTitle = 'attrTitle' in options
                ? options.attrTitle
                : `${options.attrName[0].toUpperCase()}${options.attrName.substr(1)}`

    
    let factory;

    return class AttrComponent extends Component {
        constructor(props) {
            super(props)
            factory = new Factory(this, options)
        }


        render() {

            return (
                <div className="">
                    <h3>Hoc Editable {Component.name}</h3>
                    {!options.infoDown && factory.renderAttr()}
                    {super.render()}
                    {options.infoDown && factory.renderAttr()}
                </div>
            )
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