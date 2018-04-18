import React from 'react'
import ReactDOM from 'react-dom'
import EditableView from './EditableView'

let refsContainer = {
  // [groupName]: refContainer
}

export function getContainer() {
  let wrap = document.querySelector('.' + 'attr-editable-wrap')
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.setAttribute('class', 'attr-editable-wrap')

    document.body.addEventListener(
      'mousemove',
      evt => {
        const startPoint = wrap.pos
        if (startPoint && (evt.buttons || evt.type === 'touchmove')) {
          const clientX = evt.clientX || evt.touches[0].clientX
          const clientY = evt.clientY || evt.touches[0].clientY
          const dx = clientX - startPoint.x
          const dy = clientY - startPoint.y
          wrap.pos = { x: clientX, y: clientY }
          const { left, top } = wrap.getBoundingClientRect()
          wrap.style.left = left + dx + 'px'
          wrap.style.top = top + dy + 'px'
        } else {
          wrap.pos = null
          wrap.classList.remove('movable')
        }
      },
      true
    )
    wrap.addEventListener(
      'mousedown',
      function downHandle(evt) {
        const { left, top } = this.getBoundingClientRect()
        wrap.classList.add('movable')
        this.style.left = left + 'px'
        this.style.top = top + 'px'

        this.pos = {
          x: evt.clientX || evt.touches[0].clientX,
          y: evt.clientY || evt.touches[0].clientY
        }
      },
      false
    )
    // wrap.addEventListener('mousemove', mouseHandler.bind(null, wrap), false)
    document.body.appendChild(wrap)
  }

  let container = document.createElement('div')
  container.setAttribute('class', 'attr-editable-container')
  wrap.appendChild(container)

  return container
}

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

    let groupDom = document.createElement('div')
    groupDom.setAttribute('class', 'attr-editable-group-name')
    groupDom.textContent = groupName
    groupDom.addEventListener('click', toggleGroup, false)

    refsContainer[groupName].appendChild(groupDom)

    groupDom = document.createElement('div')
    groupDom.setAttribute('class', 'attr-editable-root')
    refsContainer[groupName]._root_ = groupDom
    refsContainer[groupName].appendChild(groupDom)
  } else {
  }

  if (!this._refsComponent) {
    let refsComponent = document.createElement('div')
    refsComponent.setAttribute('class', 'attr-editable-item')

    refsContainer[groupName]._root_.appendChild(refsComponent)
    // let container = refsContainer[groupName].lastChild
    // container.insertBefore(refsComponent, container.firstChild);
    this._refsComponent = refsComponent
  } else {
  }

  ReactDOM.render(component, this._refsComponent)
}

export function removeComponent(groupName) {
  if (this._refsComponent) {
    ReactDOM.unmountComponentAtNode(this._refsComponent)
    this._refsComponent.parentNode.removeChild(this._refsComponent)
    this._refsComponent = null

    if (
      !refsContainer[groupName].lastChild ||
      !refsContainer[groupName].lastChild.hasChildNodes()
    ) {
      removeContainer(groupName)
    }
  }
}

export function removeContainer(groupName) {
  if (refsContainer[groupName]) {
    ReactDOM.unmountComponentAtNode(refsContainer[groupName])
    refsContainer[groupName].parentNode.removeChild(refsContainer[groupName])
    refsContainer[groupName] = null
  }
}

export default class Factory {
  constructor(ref, opt) {
    this.ref = ref
    this.opt = opt

    this.view = (
      <EditableView
        ref={r => (this.refEditableView = r)}
        refComponent={ref}
        opt={this.opt}
      />
    )
  }

  render() {
    render.call(this, this.view, this.opt.groupName)
  }

  update() {
    this.refEditableView && this.refEditableView.forceUpdate()
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
}
