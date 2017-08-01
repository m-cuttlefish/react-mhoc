/**
 * @file   style-useable
 * @author yucong02
 */

// const isDevMode = process.env.NODE_ENV !== 'production'

export default function (styleInstance = {}) {
    return componentClass =>
        class extends componentClass {
            componentWillMount(...args) {
                styleInstance.use && styleInstance.use();
                if (super.componentWillMount) {
                    super.componentWillMount.apply(this, args)
                }
            }

            componentWillUnmount(...args) {
                styleInstance.unuse && styleInstance.unuse();
                if (super.componentWillUnmount) {
                    super.componentWillUnmount.apply(this, args)
                }
            }
        }
}