import React, { Component } from 'react';

import Echarts from 'echarts';

class Dashbord extends Component {
    componentDidMount() {
        let chart = Echarts.init(this.refs.container);

        chart.setOption({
            animation: false,
            bmap: {
                center: [120.13066322374, 30.240018034923],
                zoom: 14,
                roam: true
            },
            visualMap: {
                show: false,
                top: 'top',
                min: 0,
                max: 5,
                seriesIndex: 0,
                calculable: true,
                inRange: {
                    color: ['blue', 'blue', 'green', 'yellow', 'red']
                }
            },
            series: [{
                type: 'heatmap',
                coordinateSystem: 'bmap',
                pointSize: 5,
                blurSize: 6
            }]
        });
    }

    render() {
        return (<div ref='container' style={{ width:'100%', height: '480px' }}></div>)
    }
}

export default Dashbord;
