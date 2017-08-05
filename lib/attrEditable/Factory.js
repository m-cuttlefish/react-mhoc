import React from 'react'
import c from 'classname'
import ReactDOM from 'react-dom'
import {isRecursive} from '../helper'


function mouseOverHandler(wrapDom, evt) {
    if ( (evt.metaKey || evt.ctrlKey)) {
        if (!wrapDom.startPoint) {
            let rect = wrapDom.getBoundingClientRect()
            wrapDom.startPoint = {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            }
        }
        wrapDom.classList.add('movable')
    } else {
        delete wrapDom.startPoint
        wrapDom.classList.remove('movable')
    }
}

let refsContainer = {
    // [groupName]: refContainer
}

export function getContainer() {
    let wrap = document.querySelector('.' + 'attr-editable-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.setAttribute('class', 'attr-editable-wrap');

        document.body.addEventListener('mouseover', evt => {
            var startPoint = wrap.startPoint
            if (startPoint) {
                wrap.style.left = (evt.clientX - startPoint.x) + 'px'
                wrap.style.top = (evt.clientY - startPoint.y) + 'px'
                if (!evt.ctrlKey && !evt.metaKey) {
                    delete wrap.startPoint
                    wrap.classList.remove('movable')
                }
            }
        }, true)
        wrap.addEventListener('mouseover', mouseOverHandler.bind(null, wrap), false)
        document.body.appendChild(wrap);
    }

    let container = document.createElement('div');
    container.setAttribute('class', 'attr-editable-container');
    wrap.appendChild(container)

    return container;
}

/*export function renderUpdate(component) {
 component._refsComponent

 ReactDOM.render(
 component,
 refsComponent
 )
 }*/

function toggleGroup(evt) {
    let root = evt.target.nextElementSibling
    if (root._hide_) {
        root.style.display = ''
        // root.style.width = ''
        root._hide_ = false
    } else {
        root.style.display = 'none'
        // root.style.width = '0'
        root._hide_ = true
    }
}

export function render(component, groupName) {
    if (!refsContainer[groupName]) {
        refsContainer[groupName] = getContainer()

        let groupDom = document.createElement('div');
        groupDom.setAttribute('class', 'attr-editable-group-name');
        groupDom.textContent = groupName
        groupDom.addEventListener('click', toggleGroup, false)

        refsContainer[groupName].appendChild(groupDom);

        groupDom = document.createElement('div');
        groupDom.setAttribute('class', 'attr-editable-root');
        refsContainer[groupName]._root_ = groupDom
        refsContainer[groupName].appendChild(groupDom);
    } else {
    }

    if (!this._refsComponent) {
        let refsComponent = document.createElement('div');
        refsComponent.setAttribute('class', 'attr-editable-item');

        refsContainer[groupName]._root_.appendChild(refsComponent)
        // let container = refsContainer[groupName].lastChild
        // container.insertBefore(refsComponent, container.firstChild);
        this._refsComponent = refsComponent
    } else {
    }

    ReactDOM.render(
        component,
        this._refsComponent
    )
}


export function removeComponent(groupName) {
    if (this._refsComponent) {
        ReactDOM.unmountComponentAtNode(this._refsComponent);
        this._refsComponent.parentNode.removeChild(this._refsComponent);
        this._refsComponent = null

        if (!refsContainer[groupName].lastChild ||
            !refsContainer[groupName].lastChild.hasChildNodes()) {
            removeContainer(groupName)
        }
    }
}

export function removeContainer(groupName) {
    if (refsContainer[groupName]) {
        ReactDOM.unmountComponentAtNode(refsContainer[groupName]);
        refsContainer[groupName].parentNode.removeChild(refsContainer[groupName]);
        refsContainer[groupName] = null;
    }
}


function renderEditableControlFrame(className, children) {
    return (
        <span className={c('editable-control', className)}>
            {children}
        </span>
    )
}

function inStr(string) {
    string = string.toString()
    string = string
        .replace(/\"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\s/g, ' ')
    return `"${string}"`
}

function outStr(string) {
    string = string.toString()
    string = string.replace(/^\"/, '').replace(/\"$/, '')
    return string
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t"/g, '\t')
}

function isAvailableInputString(val) {
    return /^\"[\s\S]*\"$/.test(val)
}

function isAvailableInputValue(value) {
    if (value === 'undefined') return undefined
    if (value === 'null') return null

    let number = parseFloat(value)
    if (isNaN(number)) {
        return isAvailableInputString(value) ? outStr(value) : ERROR_RETURN
    } else {
        return number
    }
}

function mapTypeString(value) {
    if (value == null) {
        return value
    }
    let Class = value.constructor
    switch (Class) {
        case Object:
            return '{…}'
        case Array:
            return `Array[${value.length}]`
        case Function:
            return `${value.name}()`
        case Number:
        case Boolean:
            return ''
        default:
            return value instanceof Object ? `${Class.name}{…}` : ''
    }

}

const ERROR_RETURN = {}

export default class Factory {

    renderEditableData(data, keyName, ref) {
        const renderEditableData = this.renderEditableData.bind(this)
        let id = this.id++
        const {
            editableId,
            unfoldedIds,
        } = this.state
        var isEditable = editableId === id

        // let tid = id
        const getEditableProps = ({}) => {
            // tid++
            return {
                ref: id.toString(),
                onClick: evt => {
                    this.setState({
                        editableId: id,
                        editableControlStyle: {
                            width: this.refEditableView.refs[id.toString()].getBoundingClientRect().width
                        }
                    }, () => {
                        this.refEditableView.refs[id.toString()].select()
                    })
                }
            }
        }

        const getFieldProps = ({
                                   valueKeyName = 'value',
                                   outFormat = val => val,
                                   inFormat = val => val,
                                   useDefault = true,
                                   ...props
                               }) => {

            let name = !useDefault
                ? valueKeyName
                : 'default' + valueKeyName[0].toUpperCase() + valueKeyName.substring(1)

            const isWritable = () => {
                const desc = Object.getOwnPropertyDescriptor(ref, keyName)
                if (desc && (desc.writable || desc.configurable)) {
                    return true
                }
                return false
            }

            const eventHandler = useDefault
                ? {
                    onBlur: evt => {
                        if (!isWritable()) {
                            this.setState({
                                depthId: -1,
                                editableId: -1
                            })
                            return
                        }
                        let ret = outFormat(evt.target[valueKeyName])
                        if (ret !== ERROR_RETURN) {
                            ref[keyName] = ret
                        }
                        this.setState({
                            depthId: -1,
                            editableId: -1
                        })
                    },
                    onKeyDown: function (evt) {
                        if (evt.keyCode === 13) {
                            evt.target.blur()
                        }
                    }
                } : {
                    onChange: evt => {
                        if (!isWritable()) {
                            return
                        }
                        let ret = outFormat(evt.target[valueKeyName])
                        if (ret !== ERROR_RETURN) {
                            ref[keyName] = ret
                            this.setState()
                        }
                    },
                }
            return {
                ...props,
                style: useDefault ? this.state.editableControlStyle : props.style,
                ref: id.toString(),
                name: id.toString(),
                autoFocus: true,
                [name]: inFormat(data),
                ...eventHandler,
            }
        }
        var fieldProps = getFieldProps({})
        var editableProps = getEditableProps({})

        if (typeof data === 'undefined') {
            return renderEditableControlFrame(
                'undefined',
                !isEditable
                    ? <span className="editable-plain-text" {...editableProps}>undefined</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        inFormat: val => val === undefined ? 'undefined' : inStr(val),
                        outFormat: isAvailableInputValue
                    })}
                />
            )
        }
        if (data === null) {
            return renderEditableControlFrame(
                'null',
                !isEditable
                    ? <span className="editable-plain-text" {...editableProps}>null</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        inFormat: val => val === null ? 'null' : inStr(val),
                        outFormat: isAvailableInputValue
                    })}
                />
            )
        }
        if (!data.constructor) {
            console.log(data)
            return `Not Found: ` + data
        }
        var Class = data.constructor
        if (typeof data === 'number') {
            return renderEditableControlFrame(
                Class.name,
                !isEditable
                    ? <span className="editable-plain-text" {...editableProps}>{data}</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        outFormat: isAvailableInputValue,
                    }) }
                />
            )
        }
        if (typeof data === 'string') {
            return renderEditableControlFrame(
                Class.name,
                !isEditable
                    ? <span className="editable-plain-text" {...editableProps}>{inStr(data)}</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        inFormat: inStr,
                        outFormat: isAvailableInputValue,
                    })}
                />
            )
        }
        if (typeof data === 'function') {
            return renderEditableControlFrame(
                Class.name,
                <button
                    onClick={evt => {
                        console.groupCollapsed('function name:', data.name)
                        console.log('function without arguments')
                        try {
                            console.log('  return:', data())
                        } finally {
                            console.groupEnd()
                        }
                    }}
                >{`${data.name}() {…}`}</button>
            )
        }
        if (typeof data === 'boolean') {
            return renderEditableControlFrame(
                Class.name,
                <input
                    type="checkbox"
                    {...getFieldProps({
                        valueKeyName: 'checked',
                        useDefault: false
                    }) }
                    autoFocus={false}
                />
            )
        }

        if (Class === Date) {
            return renderEditableControlFrame(
                Class.name,
                <input
                    type="datetime-local"
                    {...getFieldProps({
                        inFormat: date => {
                            function fill(src = '', size, placeholder = '0') {
                                src = src.toString()
                                var len = src.length
                                if (len === size) {
                                    return src
                                }
                                if (len > size) {
                                    return src.substr(0, size)
                                }
                                for (var i = 0; i < size - len; i++) {
                                    src = placeholder + src
                                }
                                return src
                            }

                            // yyyy-MM-ddThh:mm
                            return `${date.getFullYear()}-${fill(date.getMonth() + 1, 2)}`
                                + `-${fill(date.getDate(), 2)}`
                                + `T${fill(date.getHours(), 2)}:${fill(date.getMinutes(), 2)}`
                        },
                        outFormat: Date
                    }) }
                />
            )
        }



        var children = []
        var index = 0

        for (var key in data) {
            var value = data[key]
            index++
            let typeVal = mapTypeString(value)

            let toggleId = id + '$toggle$' + index
            var isUnfolded = unfoldedIds.indexOf(toggleId) >= 0
            children.push(
                <li
                    key={index}
                    className={c(
                        'editable-value'
                    )}
                >
                    {
                        typeof value === 'object' && value !== null
                        && <span
                            className={
                                'editable-' + (!isUnfolded ? 'folded' : 'unfolded')
                            }
                            onClick={this.toggleFold.bind(this, toggleId)}
                        />
                    }
                    <label className="editable-key-type">
                    <span
                        className="editable-key"
                        onClick={this.toggleFold.bind(this, toggleId)}
                    >{key}</span>
                        {typeVal &&
                        <span className={c('editable-type', value != null && value.constructor.name)}>{typeVal}</span>}
                    </label>
                    {!isRecursive(value)
                        ? renderEditableData(value, key, ref[keyName])
                        : (
                            <ul className={c('editable-object', value && value.constructor ? value.constructor.name : '')}>
                                <li className={c('editable-value')}>
                                    <span className=".editable-plain-text">{'<recursive>'}</span>
                                </li>
                            </ul>
                        )
                    }
                </li>
            )
        }

        // if (children.length) {
        return (
            <ul className={c('editable-object', Class.name)}>
                {children}
            </ul>
        )
        // }
        return null
    }

    renderAttr(opt = this.opt) {
        this.id = 0

        return (
            <div className={`attr-editable-main attr-editable-name-${opt.attrTitle.toLowerCase()}`}>
                <span
                    className={'editable-' + (this.state.unfolded ? 'unfolded' : 'folded')}
                    onClick={() => this.setState({unfolded: !this.state.unfolded})}
                />
                <div
                    className={c('attr-editable-title')}
                    onClick={() => this.setState({unfolded: !this.state.unfolded})}
                >
                    {opt.attrTitle}
                </div>
                {/* <pre>{stringify(this.state, { functionDetail: opt.functionDetail })}</pre> */}
                {this.renderEditableData(this.ref[opt.attrName], opt.attrName, this.ref)}
            </div>
        )
    }

    constructor(ref, opt) {
        this.ref = ref
        this.opt = opt
        // this.renderEditableData = this.renderEditableData.bind(ref)
        // this.renderAttr =
        let renderAttr = this.renderAttr.bind(this, opt)

        class EditableView extends React.Component {
            render() {
                return renderAttr()
            }
        }
        this.view = <EditableView ref={r => this.refEditableView = r}/>
    }

    render() {
        render.call(this, this.view, this.opt.groupName)
    }

    update() {
        this.refEditableView.forceUpdate()
    }

    removeView() {
        removeComponent.call(this, this.opt.groupName)
        this.view = null
    }

    setState(state, callback) {
        this.state = {
            ...this.state,
            ...state
        }
        this.ref.forceUpdate(callback)
        // this.forceUpdate(callback)
    }

    toggleFold(id) {
        let i = -1
        if ((i = this.state.unfoldedIds.indexOf(id)) >= 0) {
            this.state.unfoldedIds.splice(i, 1)
        } else {
            this.state.unfoldedIds.push(id)
        }
        this.setState({
            unfoldedIds: this.state.unfoldedIds
        })
    }


    id = 0
    state = {
        unfolded: false,
        unfoldedIds: [],
    }

}