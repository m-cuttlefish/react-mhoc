/**
 * Created by moyu on 2017/8/4.
 */
function replacerFactory(opt) {
    function replacer(key, value) {

        if (typeof value === 'function') {
            if (opt.functionDetail) {
                return value.toString()
            } else {
                return `function ${value.name}() {...}`
            }
        }
        /*else if (value && value.constructor) {
            var nativeClassList = [
                Object, String, Date, RegExp
            ]

            var Class = value.constructor
            if (nativeClassList.indexOf(Class) >= 0) {
                if (typeof value.toJSON === 'function') {
                    return `new ${Class.name}(${value})`
                }
                return value
            } else {
                // class object
                return `new ${Class.name}(...)`
            }
        }*/
        return value
    }

    return replacer
}


export function stringify(value, opt) {
    return JSON.stringify(value, replacerFactory(opt), 2)
}