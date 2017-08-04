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
        return value
    }

    return replacer
}


export function stringify(value, opt) {
    return JSON.stringify(value, replacerFactory(opt), 2)
}