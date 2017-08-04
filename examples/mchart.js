import React from 'react'
import ReactDOM from 'react-dom'
import {Histogram} from 'react-mchart'
import 'react-mchart/css/style.css'


import editable from '../lib/editable'
import {stringify} from '../lib/helper'


const EnhancedExample = editable({
    functionDetail: true, infoDown: false
})(Histogram)

ReactDOM.render(
    <EnhancedExample />,
    document.getElementById('root')
)

