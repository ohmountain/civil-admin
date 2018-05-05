import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Bar } from 'ant-design-pro/lib/Charts';
import { MiniArea } from 'ant-design-pro/lib/Charts';
import moment from 'moment';

import { Pie } from 'ant-design-pro/lib/Charts';


const style = {
    populationNumber: {
        fontSize: 32,
        color: 'red',
        textAlign: 'center'
    },

    vehicleNumber: {
        fontSize: 32,
        color: 'green',
        textAlign: 'center'
    },

    unit: {
        fontSize: '16px',
        color: '#333'
    }
};

class Home extends Component {

    render() {

        const visitData = [];
        const salesData = [];

        var sum = 0;

        for (let i = 0; i < 12; i += 1) {
            let x = Math.floor(Math.random() * 1000) + 200;
            sum += x;

            salesData.push({
                x: `${i + 1}月`,
                y: x,
            });
        }

        const chartData = [];
        for (let i = 0; i < 20; i += 1) {
            chartData.push({
                x: (new Date().getTime()) + (1000 * 60 * 30 * i),
                y1: Math.floor(Math.random() * 100) + 10,
            });
        }

        const beginDay = new Date().getTime();
        for (let i = 0; i < 20; i += 1) {
            visitData.push({
                x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
                y: Math.floor(Math.random() * 100) + 10,
            });
        }

        const salesPieData = [
            {
                x: '大米',
                y: 4544,
            },
            {
                x: '蔬菜',
                y: 3321,
            },
            {
                x: '医药',
                y: 3113,
            },
            {
                x: '服饰箱包',
                y: 2341,
            },
            {
                x: '母婴产品',
                y: 1231,
            },
            {
                x: '其他',
                y: 1231,
            },
        ];


        return (<div>
            <Row gutter={24}>
                <Col span={12}>
                    <Card title="总疏散人数" bordered={false}>
                        <div style={ style.populationNumber }>{sum}<small style={ style.unit }> 人</small></div>
                            <Bar height={220} data={ salesData } />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="物资储备" bordered={false}>
                        <Pie
                            data={salesPieData}
                            valueFormat={val => null}
                            height={220}
                        />
                    </Card>
                </Col>

                <Col span={24}>
                    <Row>
                        <Col span={6}>
                            <Card bordered={false} bordered={true}>
                                <h3 style={{ color: '#909090' }}>疏散路线</h3>
                                <p style={{ fontSize: 32, color: '#f9004f' }}>20</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} bordered={true}>
                                <h3 style={{ color: '#909090' }}>疏散次数</h3>
                                <p style={{ fontSize: 32, color: 'green' }}>21</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} bordered={true}>
                                <h3 style={{ color: '#909090' }}>车辆数量</h3>
                                <p style={{ fontSize: 32, color: '#9803ef' }}>20</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} bordered={true}>
                                <h3 style={{ color: '#909090' }}>管理员</h3>
                                <p style={{ fontSize: 32, color: '#094e3a' }}>2</p>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col span={24} style={{ marginTop: '24px' }}>
                    <Card title="调动车辆" bordered={false}>
                        <MiniArea
                            line
                            color="#cceafe"
                            height={220}
                            data={visitData}
                        />
                    </Card>
                </Col>
            </Row>
        </div>);
    }
}

export default Home;
