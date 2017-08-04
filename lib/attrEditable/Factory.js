import React from 'react'
import c from 'classname'
import ReactDOM from 'react-dom'


let refsContainer = null

export function getContainer() {
    const classname = 'attr-editable-container';
    let container = document.querySelector('.' + classname);
    if (!container) {
        container = document.createElement('div');
        container.setAttribute('class', classname);
        document.body.appendChild(container);
    }


    // refsContainer = container
    return container;
}

/*export function renderUpdate(component) {
 component._refsComponent

 ReactDOM.render(
 component,
 refsComponent
 )
 }*/

export function render(component) {
    if (!refsContainer) {
        refsContainer = getContainer()
    }

    if (!this._refsComponent) {
        let refsComponent = document.createElement('div');
        refsComponent.setAttribute('class', 'attr-editable-root');
        refsContainer.appendChild(refsComponent);
        this._refsComponent = refsComponent
    }

    ReactDOM.render(
        component,
        this._refsComponent
    )
}


export function removeComponent() {
    if (this._refsComponent) {
        ReactDOM.unmountComponentAtNode(this._refsComponent);
        this._refsComponent.parentNode.removeChild(this._refsComponent);
        this._refsComponent = null
    }
}

export function removeContainer() {
    if (refsContainer) {
        ReactDOM.unmountComponentAtNode(refsContainer);
        refsContainer.parentNode.removeChild(refsContainer);
        refsContainer = null;
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
        default:
            return ''
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
                            width: .5 + this.refEditableView.refs[id.toString()].getBoundingClientRect().width
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


            const eventHandler = useDefault
                ? {
                    onBlur: evt => {
                        if (!Object.getOwnPropertyDescriptor(ref, keyName).writable) {
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
                        if (!Object.getOwnPropertyDescriptor(ref, keyName).writable) {
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
                ref: id.toString(),
                name: id.toString(),
                autoFocus: true,
                [name]: inFormat(data),
                ...eventHandler,
                style: this.state.editableControlStyle
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


                    {renderEditableData(value, key, ref[keyName])}
                </li>
            )
        }

        if (children.length) {
            return (
                <ul className={c('editable-object', Class.name)}>
                    {children}
                </ul>
            )
        }
        return null
    }

    renderAttr(opt) {
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
        // this.renderEditableData = this.renderEditableData.bind(ref)
        this.renderAttr = this.renderAttr.bind(this, opt)
        let renderAttr = this.renderAttr

        class EditableView extends React.Component {
            render() {
                return renderAttr()
            }
        }
        this.view = <EditableView ref={r => this.refEditableView = r}/>
    }

    render() {
        render.call(this, this.view)
    }

    update() {
        this.refEditableView.forceUpdate()
    }

    removeView() {
        removeComponent.call(this)
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