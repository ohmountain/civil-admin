import React, { Component } from 'react';
import { Table, Spin, message, Modal } from 'antd';

import { PAGINATION_EVACUATION_API, GET_EVACUATION_RESOURCES_API ,GET } from '../../utils/api.js';

class Evacuation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spin: false,
            data: [],
            pagination: {
                page: 1,
                total: 0,
                pageSize: 20
            },
            resources: [],
            showModal: false
        };
    }

    componentDidMount() {
        this.requestData(this.state.pagination.page, this.state.pagination.pageSize);
    }

    requestData(page = 1, pageSize = 20) {

        this.setState({ spin: true });

        let timmer = setTimeout(() => {

            GET(`${PAGINATION_EVACUATION_API.url}?page=${page}&count=${pageSize}`).then(response => {

                clearTimeout(timmer);

                if (response.ok) {
                    return response.json();
                }

                throw new Error('获取疏散路线失败!');
            }).then(json => {

                let pagination = {
                    page: page,
                    pageSize: pageSize,
                    total: json.data.max_count
                };

                this.setState({
                    spin: false,
                    data: json.data.evacuations,
                    pagination
                });

                message.success("获取成功");

            }).catch(e => {
                message.error(e.toString());
            })
        }, 100);
    }

    getEvacuationResources(evacuation) {
        console.log(evacuation);
        let url = `${GET_EVACUATION_RESOURCES_API.url}?id=${evacuation.id}`;

        GET(url).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("获取资源列表失败");
        }).then(json => {
            if (json.code !== 200) {
                throw new Error(json.message);
            }

            this.setState({ resources: json.resources, showModal: true });
            message.success("获取资源列表成功");
        }).catch(e => {
            message.error(e.message);
        });
    }

    closeModal() {
        this.setState({ showModal: false });
    }

    columns = [{
        title: '路线',
        children: [{
            title: '始发地',
            dataIndex: 'route.departure',
            key: 'departure',
            render: function(dept) { return `${dept.name} (${dept.longitude}, ${dept.latitude})` }
        }, {
            title: '目的地',
            dataIndex: 'route.destination',
            key: 'destination',
            render: function(dest) { return `${dest.name} (${dest.longitude}, ${dest.latitude})` }
        }]
    }, {
        title: '车辆',
        children: [{
            title: '车牌号',
            dataIndex: 'vehicle.license',
            key: 'license'
        }, {
            title: '车型',
            dataIndex: 'vehicle.type',
            key: 'type'
        }, {
            title: '所有人(单位)',
            dataIndex: 'vehicle.owner',
            key: 'owner'
        }]
    }, {
        title: '疏散时间',
        children: [{
            title: '开始时间',
            dataIndex: 'start_time',
            key: 'start_time'
        }, {
            title: '结束时间',
            dataIndex: 'finish_time',
            key: 'finish_time'
        }]
    }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status'
    }, {
        title: '人数',
        dataIndex: 'peoples',
        key: 'peoples'
    }, {
        title: '操作',
        render: (record) => <a onClick={ () => { this.getEvacuationResources(record);  } }>物资转运记录</a>
    }];

    resourceColumns = [{
        title: '物资名称',
        dataIndex: 'name',
        key: 'name'
    }, {
        title: '数量',
        dataIndex: 'number',
        key: 'number'
    }, {
        title: '计量单位',
        dataIndex: 'unit',
        key: 'unit'
    }]

    render() {
        return (<Spin spinning={ this.state.spin }>
                <Table
                    bordered
                    columns={ this.columns }
                    rowKey={ record => record.id }
                    dataSource={ this.state.data }
                    pagination={{
                        defaultCurrent: this.state.pagination.page,
                        total: this.state.pagination.total,
                        pageSize: this.state.pagination.pageSize,
                        onChange: this.requestData.bind(this)
                    }}>
                </Table>
                <Modal visible={ this.state.showModal } title="物资转运记录" footer={ null } onCancel={ this.closeModal.bind(this) }>
                    <Table columns={ this.resourceColumns } rowKey={ r=>r.id } dataSource={ this.state.resources } pagination={ false }></Table>
                </Modal>
        </Spin>);
    }
}

export default Evacuation;
