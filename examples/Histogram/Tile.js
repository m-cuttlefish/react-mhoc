/**
 * @file   Tile
 * @author yucong02
 */
import React from 'react'
import {Histogram} from 'react-mchart'
import editable from '../../lib/editable'

const EditableHistogram = editable({
    attrNames: ['state'], groupName: 'TileHistogram'
})(Histogram)

export default class TileHistogram extends React.Component {

    static defaultProps = {
        xAxis: [
            {
                value: '百度',
                style: {
                    // color: 'red'
                }
            },
            '谷歌'
        ],
        animate: true,
        data: [
            [
                {
                    value: 12,
                    // color: 'blue',
                    label: '上半年',
                    onClick: () => alert('hello')
                },
                {
                    value: 11,
                    color: 'rgb(249, 204, 157)',
                    label: '下半年',
                    onClick: () => alert('world')
                },
            ],
            {
                value: 14,
                // color: 'green'
            }
        ],
        rectWidth: 35,
        height: 250
    }

    render() {
        return (
            <EditableHistogram
                {...this.props}
            />
        )
    }
}