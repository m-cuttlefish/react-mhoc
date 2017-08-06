import React from 'react'
import c from 'classname'
import ReactDOM from 'react-dom'
import {isRecursive} from '../helper'


function parentUtil(root, className) {
    while ((root = root.parentElement) !== document.body) {
        if (root.classList.contains(className)) {
            break
        }
    }
    return root
}

function findChild(parent, className, reverse = false) {
    if (reverse) {
        for (let i = parent.children.length - 1; i >= 0; i--) {
            let child = parent.children[i]
            if (child.classList.contains(className)) {
                return child
            }
        }
    } else {
        for (let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i]
            if (child.classList.contains(className)) {
                return child
            }
        }
    }
}

function getLastChildId(parent) {
    let lastChildId, objChildEle;
    if (parent.nextElementSibling && parent.nextElementSibling.classList.contains('editable-value')) {
        lastChildId = Number(parent.nextElementSibling.getAttribute('name').replace(/^editable-id-/, ''))
    } else if (objChildEle = findChild(parent, 'editable-object', true)) {
        let valueEle = findChild(objChildEle, 'editable-value', true)
        if (valueEle) {
            lastChildId = getLastChildId(valueEle)
        } else {
            lastChildId = Number(parent.getAttribute('name').replace(/^editable-id-/, '')) + 1
        }
    } else {
        lastChildId = Number(parent.getAttribute('name').replace(/^editable-id-/, '')) + 1
    }
    return lastChildId
}

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


function outerRenderEditableControlFrame(className, children, props) {
    return (
        <span className={c('editable-control', className)}>
            {children}
            <span {...props} className="editable-operation editable-operation-del">{' - '}</span>
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
    if (value === 'true') return true
    if (value === 'false') return false

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

    renderEditableData(data, keyName, ref, depth = 0, isLast) {
        const renderEditableData = this.renderEditableData.bind(this)
        let id = ++this.id
        const {
            editableId,
            unfoldedIds,
            depth: stateDepth
        } = this.state

        // if (keyName === 'b') {
        //     debugger
        // }

        var isEditable = editableId === id
        let idProps = {} //{name: 'editable-id-' + id.toString()}

        // let tid = id
        const getEditableProps = ({}) => {
            // tid++
            return {
                ref: id.toString(),
                ...idProps,
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
                                   ref: localRef = ref,
                                   value: localValue = data,
                                   keyName: localKeyName = keyName,
                                   ...props
                               }) => {

            let name = !useDefault
                ? valueKeyName
                : 'default' + valueKeyName[0].toUpperCase() + valueKeyName.substring(1)

            const isWritable = () => {
                const desc = Object.getOwnPropertyDescriptor(ref, keyName)
                if (!desc || (desc.writable || desc.configurable)) {
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
                            this.ref.forceUpdate()
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
                            localRef[localKeyName] = ret
                            this.ref.forceUpdate()
                        }
                    },
                }
            return {
                ...props,
                style: useDefault ? this.state.editableControlStyle : props.style,
                ref: id.toString(),
                ...idProps,
                autoFocus: true,
                [name]: inFormat(localValue),
                ...eventHandler,
            }
        }
        var fieldProps = getFieldProps({})
        var editableProps = getEditableProps({})
        let delOpProps = {
            onDoubleClick: evt => {
                if (delete ref[keyName] && typeof ref[keyName] === 'undefined') {
                    this.ref.forceUpdate()
                } else alert('fail to delete')
            }
        }

        let renderEditableControlFrame = function (className, children, delProps = delOpProps) {
            return outerRenderEditableControlFrame(className, children, delProps)
        }

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
            return <span className="editable-plain-text" {...idProps}>{`Not Found: ` + data}</span>
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
                    {...idProps}
                    onClick={evt => {
                        console.groupCollapsed('function name:', data.name)
                        console.log('function without arguments')
                        try {
                            console.log('  return:', data())
                        } finally {
                            console.groupEnd()
                        }
                    }}
                >{`${data.name}()`}</button>
            )
        }
        if (typeof data === 'boolean') {
            return renderEditableControlFrame(
                Class.name,
                !isEditable
                    ? <span className="editable-plain-text" {...editableProps}>{data.toString()}</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        inFormat: v => v.toString(),
                        outFormat: isAvailableInputValue,
                    })}
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
                />,

            )
        }



        var children = []
        var index = 0


        const fillObjectChildren = (key, value, enumerable = true) => {
            let typeVal = mapTypeString(value)

            let toggleId = id + '$toggle$' + index
            var isUnfolded = unfoldedIds.indexOf(toggleId) >= 0
            var foldAble = typeof value === 'object' && value !== null
            isUnfolded = isUnfolded || !foldAble

            children.push(
                <li
                    key={index}
                    className={c(
                        'editable-value'
                    )}
                    name={'editable-id-' + (this.id)}
                >
                    {
                        foldAble
                        ? <span
                            className={
                                'editable-' + (!isUnfolded ? 'folded' : 'unfolded')
                            }
                            onClick={this.toggleFold.bind(this, toggleId)}
                        />
                        : typeof value === 'boolean'
                            && <input
                                type="checkbox"
                                {...getFieldProps({
                                    ref: ref[keyName],
                                    keyName: key,
                                    value,
                                    valueKeyName: 'checked',
                                    useDefault: false
                                }) }
                                autoFocus={false}
                            />
                    }
                    <label className={c('editable-key-type', enumerable ? 'enumerable' : 'denumerable')}>
                    <span
                        className="editable-key"
                        onClick={foldAble ? this.toggleFold.bind(this, toggleId) : null}
                    >{key}</span>
                        {typeVal &&
                            <span className={c('editable-type', value != null && value.constructor.name)}>
                                {typeVal}
                                {
                                    <span
                                        className={c('editable-operation editable-operation-add')}
                                        onClick={evt => {
                                            this.unfold(toggleId)
                                            this.setState({
                                                depth: depth + 1,
                                                keyName: key
                                            })
                                        }}
                                    >+</span>
                                }
                            </span>
                        }
                    </label>
                    {isUnfolded && renderEditableData(value, key, ref[keyName], depth + 1)}
                </li>
            )
        }


        if (data instanceof Array) {
            for (; index < data.length; ) {
                var value = data[index]
                index++
                fillObjectChildren(index - 1, value)
            }
        } else {
            let keys = Object.getOwnPropertyNames(data)

            /*if (typeof data === 'function') {
                keys = keys.filter(x => !(['caller', 'arguments'].includes(x)))
            }*/
//depth !== 0 &&
            Class !== Object && keys.push('__proto__')
            for (let i in keys) {
                var key = keys[+i]
                var value = data[key]
                index++
                fillObjectChildren(key, value, data.propertyIsEnumerable(key))
            }
        }


        if (keyName === this.state.keyName
            && stateDepth - depth === 0) {
            children.push(
                <li
                    key={children.length + 1}
                    className={c('editable-add-control')}
                >
                    <label className="editable-key-type">
                        <span className="editable-key">
                            <input type="text"
                                   autoFocus={true}
                                   placeholder="input key"
                                   ref={r => this.addInputKey = r}
                                   onKeyDown={evt => {
                                       if (evt.keyCode === 13) {
                                           this.addInputControlBlur(ref)
                                       }
                                   }}
                                   onBlur={evt  => {
                                       setTimeout(() => {
                                           if (this.addInputVal && this.addInputVal !== document.activeElement) {
                                               this.addInputControlBlur(ref)
                                           }
                                       }, 0)
                                   }}
                            />
                        </span>
                    </label>
                    {renderEditableControlFrame(
                        'add-operation',
                        <input type="text"
                               placeholder="input value"
                               ref={r => this.addInputVal = r}
                               onBlur={evt => {
                                   setTimeout(() => {
                                       if (this.addInputKey && this.addInputKey !== document.activeElement) {
                                           this.addInputControlBlur(ref, keyName)
                                       }
                                   }, 0)
                               }}
                               onKeyDown={evt => {
                                   if (evt.keyCode === 13) {
                                       this.addInputControlBlur(ref, keyName)
                                   }
                               }}
                        />,
                        {
                            onClick: evt => {
                                this.setState({
                                    depth: undefined
                                })
                            }
                        }
                    )}
                </li>
            )
        }


        return (
            <ul {...idProps} className={c('editable-object', Class.name)}>
                {children}
            </ul>
        )
    }

    addInputControlBlur(ref, keyName, evt) {
        if (this.addInputVal.value && this.addInputKey.value) {
            let value, key;

            if(isAvailableInputValue(this.addInputVal.value) !== ERROR_RETURN) {
                key = !isNaN(parseFloat(this.addInputKey.value))
                    ? parseFloat(this.addInputKey.value)
                    : outStr(this.addInputKey.value)
                value = isAvailableInputValue(this.addInputVal.value)
                ref[keyName][key] = value
                this.ref.forceUpdate()
                this.setState({
                    depth: undefined
                })
            }
        }
    }

    renderAttr(opt = this.opt) {
        this.id = 0
        let addAble = this.ref[opt.attrName] instanceof Object

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
                {addAble &&
                    <span
                        className="editable-operation editable-operation-add"
                        onClick={evt => {
                            this.setState({
                                unfolded: true,
                                depth: 0,
                                keyName: opt.attrName
                            })
                        }}
                    >+</span>
                }
                {/* <pre>{stringify(this.state, { functionDetail: opt.functionDetail })}</pre> */}
                {this.state.unfolded && this.renderEditableData(this.ref[opt.attrName], opt.attrName, this.ref, 0, false)}
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
        this.refEditableView.forceUpdate(callback)
        // this.forceUpdate(callback)
    }

    unfold(id, callback) {
        if ((this.state.unfoldedIds.indexOf(id)) < 0) {
            this.state.unfoldedIds.push(id)
            this.setState({
                unfoldedIds: this.state.unfoldedIds
            }, callback)
        }
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