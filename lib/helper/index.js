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



export function isRecursive(obj) {
    let tracked = []

    if (obj == null) {
        return false
    }
    function innerMethod(obj) {
        if (!(obj instanceof Object)) return false
        tracked.push(obj)

        for (let key in obj) {
            let val = obj[key]
            let founded = tracked.findIndex(x => x === val) >= 0
            if (founded) return true

            if (innerMethod(val)) {
                return true
            }
        }
        return false
    }

    return innerMethod(obj)
}