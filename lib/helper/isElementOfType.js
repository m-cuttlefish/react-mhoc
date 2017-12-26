/**
 * @file: isElementOfType
 * @author: Cuttle Cong
 * @date: 2017/12/12
 * @description:
 */
import React from 'react'

export default Component => {

  // Trying to solve the problem with 'children: XXX.isRequired'
  // (https://github.com/gaearon/react-hot-loader/issues/710). This does not work for me :(
  const originalPropTypes = Component.propTypes
  Component.propTypes = undefined

  // Well known workaround
  const elementType = (<Component/>).type

  // Restore originalPropTypes
  Component.propTypes = originalPropTypes

  return element => element.type === elementType
}
