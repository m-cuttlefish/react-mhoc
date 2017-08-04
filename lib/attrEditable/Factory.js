import React from 'react'
import c from 'classname'

function renderEditableControlFrame(className, children) {
    return (
        <span className={c('editable-control', className)}>
            {children}
        </span>
    )
}

export default class Factory {

    renderEditableData(data, keyName, ref) {
        const renderEditableData = this.renderEditableData.bind(this)

        const getFieldProps = ({
            valueKeyName = 'value',
            outFormat = val => val,
            inFormat = val => val
        }) => {

            return {
                [valueKeyName]: inFormat(data),
                onChange: evt => {
                    // debugger
                    if (!Object.getOwnPropertyDescriptor(ref, keyName).writable) {
                        // readonly bug
                        return
                    }
                    ref[keyName] = outFormat(evt.target[valueKeyName])
                    this.ref.forceUpdate()
                }
            }
        }
        var fieldProps = getFieldProps({})

        if (typeof data === 'undefined') {
            return renderEditableControlFrame(
                'undefined',
                <span className="plain-text">
                    {`undefined`}
                </span>
            )
        }
        if (data === null) {
            return renderEditableControlFrame(
                'null',
                <span className="plain-text">
                    {`null`}
                </span>
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
                <input
                    type="text"
                    {...getFieldProps({ outFormat: val => isNaN(val) ? val : Number(val) }) }
                />
            )
        }
        if (typeof data === 'string') {
            return renderEditableControlFrame(
                Class.name,
                <input type="text" {...fieldProps} />
            )
        }
        if (typeof data === 'function') {
            return renderEditableControlFrame(
                Class.name,
                <input
                    type="button"
                    value={`${data.name}()`}
                    onClick={evt => {
                        console.groupCollapsed('function name:', data.name)
                        console.log('function without arguments')
                        try {
                            console.log('  return:', data())
                        } finally {
                            console.groupEnd()
                        }
                    }}
                />
            )
        }
        if (typeof data === 'boolean') {
            return renderEditableControlFrame(
                Class.name,
                <input
                    type="checkbox"
                    {...getFieldProps({ valueKeyName: 'checked' }) }
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
            children.push(
                <li
                    key={index++}
                    className={c('debug-value')}
                >
                    <label>{key}</label>
                    {renderEditableData(value, key, ref[keyName])}
                </li>
            )
        }

        if (children.length) {
            return (
                <ul className={c('debug-object', Class.name)}>
                    {children}
                </ul>
            )
        }
        return null
    }

    renderAttr(opt) {
        
        return (
            <div>
                <p>
                    {opt.attrTitle}
                </p>
                {/* <pre>{stringify(this.state, { functionDetail: opt.functionDetail })}</pre> */}
                {this.renderEditableData(this.ref[opt.attrName], opt.attrName, this.ref)}
            </div>
        )
    }

    constructor(ref, opt) {
        this.ref = ref
        // this.renderEditableData = this.renderEditableData.bind(ref)
        this.renderAttr = this.renderAttr.bind(this, opt)
    }

}