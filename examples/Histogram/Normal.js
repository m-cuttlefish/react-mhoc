/**
 * @file   Normal
 * @author yucong02
 */
import React from 'react'
import {Histogram} from 'react-mchart'

export default class NormalHistogram extends React.Component {
    static defaultProps = {
        xAxis: [
            {
                value: '百度',
                style: {
                    color: 'red'
                }
            },
            '谷歌'
        ],
        animate: true,
        data: [
            {
                value: 23,
                color: 'blue'
            },
            {
                value: 14,
                // color: 'green'
            }
        ],
        rectProps: {
            style: {
                backgroundColor: 'cyan'
            }
        },
        rectWidth: 35,
        height: 250,
        xAxisProps: {
            style: {
                color: 'yellow'
            }
        }
    }

    render() {
        return (
            <Histogram
                {...this.props}
            />
        )
    }
}