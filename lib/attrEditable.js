function renderEditableControlFrame(className, children) {
    return (
        <span className={c('editable-control', className)}>
            {children}
        </span>
    )
}

function attrDebug(Component, options = {}) {
    options.functionDetail = 'functionDetail' in options ? options.functionDetail : false
    options.infoDown = 'infoDown' in options ? options.infoDown : false
    options.attrName = 'attrName' in options ? options.attrName : 'state'

    function renderEditableData(data, keyName, ref) {

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
                    this.forceUpdate()
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
        if (!data || !data.constructor) {
            console.log(data)
        }
        var Class = data.constructor
        if (typeof data === 'number') {
            return renderEditableControlFrame(
                Class.name,
                <input
                    type="number"
                    {...getFieldProps({ outFormat: Number }) }
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
                        console.groupCollapsed('funciton name:', data.name)
                        console.log('funciton without arguments')
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



    function renderAttr(opt) {
        return (
            <div>
                <p>
                    {opt.attrName.toUpperCase()}
                </p>
                {/* <pre>{stringify(this.state, { functionDetail: opt.functionDetail })}</pre> */}
                {renderEditableData(this[opt.attrName], opt.attrName, this)}
            </div>
        )
    }

    return class AttrComponent extends Component {
        constructor(props) {
            super(props)
            renderEditableData = renderEditableData.bind(this)
            // renderInfo = renderInfo.bind(this, options)
            renderAttr = renderAttr.bind(this, options)
        }

        render() {
            return (
                <div style={{ padding: '5px', border: '1px solid #ddd', borderRadius: 5 }}>
                    <h3>Hoc Debugger {Component.name}</h3>
                    {!options.infoDown && renderAttr()}
                    {super.render()}
                    {options.infoDown && renderAttr()}
                </div>
            )
        }
    }

}