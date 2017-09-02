import React from 'react'
import ReactDOM from 'react-dom'
import c from 'classname'
import './style.css'

function outterRenderEditableControlFrame(className, children, props) {
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

    // debugger
    if (/^\s*\{[\s\S]*\}\s*$/.test(value)) {
        try {
            value = new Function(`return eval(${value})`)()
        } catch (ex) {
            throw ex
            return ERROR_RETURN
        }
        return value
    }
    if (/^\s*\[[\s\S]*\]\s*$/.test(value)) {
        try {
            value = new Function(`return eval(${value})`)()
        } catch (ex) {
            throw ex
            return ERROR_RETURN
        }
        return value
    }

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
        case Date:
            return ''
        default:
            return value instanceof Object ? `${Class.name}{…}` : ''
    }

}

const ERROR_RETURN = {}

export default class EditableView extends React.Component {

    renderEditableData(data, keyName, ref, depth = 0) {
        const renderEditableData = this.renderEditableData.bind(this)
        let id = ++this.id
        const {
            editableId,
            unfoldedIds,
            highlightId,
            depth: stateDepth
        } = this.state

        // if (keyName === 'b') {
        //     debugger
        // }

        var isEditable = editableId === id
        var isHighlight = highlightId === id
        let idProps = {} //'data-editable-id': id

        // let tid = id
        const getEditableProps = ({}) => {
            // tid++
            return {
                ref: id.toString(),
                ...idProps,
                className: c('editable-plain-text', isHighlight && 'editable-highlight'),
                onClick: evt => {
                    this.setState({
                        editableId: id,
                        editableControlStyle: {
                            width: this.refs[id.toString()].getBoundingClientRect().width
                        }
                    }, () => {
                        this.refs[id.toString()].select()
                    })
                }
            }
        }

        const getFieldProps = ({
                                   currentId = id,
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
                                editableId: -1
                            })
                            return
                        }
                        let ret = outFormat(evt.target[valueKeyName])
                        if (ret !== ERROR_RETURN && localRef[localKeyName] !== ret) {
                            localRef[localKeyName] = ret
                            this.ref.forceUpdate()
                            this.setState({
                                highlightId: currentId
                            }, () => {
                                if (this._timerB != null) {
                                    clearTimeout(this._timerB)
                                }
                                this._timerB = setTimeout(() => {
                                    this.setState({
                                        highlightId: -1
                                    })
                                    delete this._timerB
                                }, 500)
                            })
                        }
                        this.setState({
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
                        if (ret !== ERROR_RETURN && localRef[localKeyName] !== ret) {
                            localRef[localKeyName] = ret
                            this.ref.forceUpdate()
                            this.setState({
                                highlightId: currentId + 1
                            }, () => {
                                if (this._timerA != null) {
                                    clearTimeout(this._timerA)
                                }
                                this._timerA = setTimeout(() => {
                                    this.setState({
                                        highlightId: -1
                                    })
                                    delete this._timerA
                                }, 500)

                            })
                        }
                    },
                }
            return {
                style: useDefault ? this.state.editableControlStyle : props.style,
                ...props,
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
            return outterRenderEditableControlFrame(className, children, delProps)
        }

        if (typeof data === 'undefined') {
            return renderEditableControlFrame(
                'undefined',
                !isEditable
                    ? <span {...editableProps}>undefined</span>
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
                    ? <span {...editableProps}>null</span>
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
                    ? <span {...editableProps}>{data}</span>
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
                    ? <span {...editableProps}>{inStr(data)}</span>
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
                    ? <span {...editableProps}>{data.toString()}</span>
                    : <input
                    type="text"
                    {...getFieldProps({
                        inFormat: v => v.toString(),
                        outFormat: isAvailableInputValue,
                    })}
                />
            )
        }

        if (data instanceof Date) {
            return renderEditableControlFrame(
                Class.name,
                (
                    !isEditable
                        ? <span {...editableProps}>{data.toLocaleString()}</span>
                        : <input
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
                            outFormat: val => new Date(val),
                            style: {width: 'auto'}
                        }) }
                    />
                ),
            )
        }



        var children = []
        var index = 0


        const fillObjectChildren = (key, value, enumerable = true) => {
            let typeVal = mapTypeString(value)

            let toggleId = id + '$toggle$' + index
            var isUnfolded = unfoldedIds.indexOf(toggleId) >= 0
            var foldAble = typeof value === 'object' && value !== null
            foldAble = foldAble && !(value instanceof Date)
            isUnfolded = isUnfolded || !foldAble

            children.push(
                <li
                    key={index}
                    className={c('editable-value')}
                    // data-editable-id={this.id}
                >
                    {
                        foldAble
                        ? <span
                            className={'editable-' + (!isUnfolded ? 'folded' : 'unfolded')}
                            onClick={this.toggleFold.bind(this, toggleId)}
                        />
                        : typeof value === 'boolean'
                            && <input
                                type="checkbox"
                                {...getFieldProps({
                                    currentId: this.id,
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
                                    renderEditableControlFrame('', 
                                        <span
                                            className={c('editable-operation editable-operation-add')}
                                            onClick={evt => {
                                                this.unfold(toggleId)
                                                this.setState({
                                                    depth: depth + 1,
                                                    keyName: key
                                                })
                                            }}
                                        >+</span>,
                                        {
                                            onDoubleClick: evt => {
                                                if (delete ref[keyName][key] && typeof ref[keyName][key] === 'undefined') {
                                                    this.fold(toggleId)
                                                    this.ref.forceUpdate()
                                                } else alert('fail to delete')
                                            }
                                        }
                                    )
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
            <div
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                style={this.state.style}
                className={`attr-editable-main attr-editable-name-${opt.attrTitle.toLowerCase()}`}>
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
                <span
                    className="editable-operation editable-operation-view"
                    onClick={this.handleClickView}
                >{!opt.hideViewBtn && 'view'}</span>
                {/* <pre>{stringify(this.state, { functionDetail: opt.functionDetail })}</pre> */}
                {this.state.unfolded && this.renderEditableData(this.ref[opt.attrName], opt.attrName, this.ref, 0)}
            </div>
        )
    }

    id = 0
    state = {
        style: {},
        unfolded: false,
        unfoldedIds: [],
        depth: undefined,
        keyName: undefined,
        highlightId: undefined,
        editableId: undefined,
        editableControlStyle: {}
    }

    fold(id, callback) {
        let i = -1
        if ((i = this.state.unfoldedIds.indexOf(id)) >= 0) {
            this.state.unfoldedIds.splice(i, 1)
            this.setState({
                unfoldedIds: this.state.unfoldedIds
            }, callback)
        }
    }


    prevOutline = ''

    handleMouseEnter = evt => {
        let compDom = ReactDOM.findDOMNode(this.props.refComponent)
        this.prevOutline = compDom.style.outline
        compDom.style.outline = '1px solid lime'
    }

    handleMouseLeave = evt => {
        let compDom = ReactDOM.findDOMNode(this.props.refComponent)
        compDom.style.outline = this.prevOutline
    }

    handleClickView = evt => {
        let compDom = ReactDOM.findDOMNode(this.props.refComponent)
        compDom.scrollIntoView({behavior: 'smooth'})
    }

    componentDidMount() {
        
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

    ref = this.props.refComponent

    render() {
        return this.renderAttr.call(this, this.props.opt)
    }

}