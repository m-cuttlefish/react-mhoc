import React from 'react'
import ReactDOM from 'react-dom'
import {Histogram} from 'react-mchart'
import 'react-mchart/css/style.css'


import editable from '../lib/editable'
import {stringify} from '../lib/helper'


const EnhancedExample = editable({
    functionDetail: true, infoDown: false,
    attrNames: ['local', 'state']
})(Histogram)

ReactDOM.render(
    <EnhancedExample
        func={() => console.log(this)}
        null={null}
        num={0}
    />,
    document.getElementById('root')
)

