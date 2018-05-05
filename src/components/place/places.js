import React, { Component } from 'react';
import { Table, Spin, message, Modal, Form, Input, Button, Select } from 'antd';

import {
    PAGINATION_PLACE_API,
    GET_ALL_UNIT_API ,
    ADD_PLACE_RESOURCE_API,
    GET_PLACE_RESOURCES_API,
    GET,
    POST
} from './../../utils/api.js';

const { Column } = Table;
const { BMap } = window;

const Option = Select.Option;
const FormItem = Form.Item;

class Place extends Component {

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
            innerMap: {
                show: false,
                name: '贵阳',
                pointer: {
                    longitude: 26.576064,
                    latitude: 106.691194
                }
            },
            innerResources: {
                show: false
            },
            placeResources: [],
            showAddResourcesModal: false,
            addResourcesTargetId: null,
            addResourcesTargetName: null,
            units: []
        };
    }

    requestData(page = 1, pageSize = 20) {

        this.setState({ spin: true });

        let timmer = setTimeout(() => {

            GET(`${PAGINATION_PLACE_API.url}?page=${page}&count=${pageSize}`).then(response => {

                clearTimeout(timmer);

                if (response.ok) {
                    return response.json();
                }


                throw {name: 'NotFoundException', message:'获取失败'};
            }).then(json => {

                let pagination = {
                    page: page,
                    pageSize: pageSize,
                    total: json.data.max_count
                };

                this.setState({
                    spin: false,
                    data: json.data.places,
                    pagination
                });

                message.success("获取成功");

            }).catch(e => {
                message.error(e.toString());
            })
        }, 100);

    }

    componentDidMount() {
        this.requestData(this.state.pagination.page, this.state.pagination.pageSize);
    }


    handlePageChange(page, pageSize) {
        this.requestData(page, pageSize);
    }

    handleGetResourcesClick(record) {
        this.setState({
            innerResources: { show: true }
        });

        GET(`${GET_PLACE_RESOURCES_API.url}?id=${record.id}`).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw {name:'NotFoundException', message:'获取失败'};
        }).then(json => {

            this.setState({
                placeResources: json.resources
            });

        }).catch(e => {
            message.error(e.message)
        });
    }

    handleAddResourcesClick(record) {

        if (this.state.units.length === 0) {
            GET(GET_ALL_UNIT_API.url).then(response => {
                if (response.ok) {
                    return response.json();
                }

                throw {name: 'NotFoundException', message:'获取物资单位列表失败！'}
            }).then(json => {
                this.setState({
                    units: json.units,
                    showAddResourcesModal: true,
                    addResourcesTargetId: record.id,
                    addResourcesTargetName: record.name
                });

            }).catch(e => {
                message.error(e.message)
            });
        } else {
            this.setState({
                showAddResourcesModal: true,
                addResourcesTargetId: record.id,
                addResourcesTargetName: record.name
            });
        }

    }

    showMap(record) {
        this.setState({
            innerMap: {
                show: true,
                name: record.name
            }
        });



        setTimeout(() => {
            this.refs.innerMap.innerHTML = '';

            let map = new BMap.Map(this.refs.innerMap);
            let point = new BMap.Point(record.longitude, record.latitude);
            map.centerAndZoom(point, 15);
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());

            let marker = new BMap.Marker(point);
            map.addOverlay(marker);
        }, 200);
    }

    render() {
        return (<div>
            <Spin spinning={ this.state.spin }>
                <Table
                    rowKey={ record => record.id }
                    dataSource={ this.state.data }
                    pagination={{
                        defaultCurrent: this.state.pagination.page,
                        total: this.state.pagination.total,
                        pageSize: this.state.pagination.pageSize,
                        onChange: this.handlePageChange.bind(this)
                    }}>

                    <Column
                        title="地名"
                        dataIndex="name"
                        key="name"
                    />

                    <Column
                        title="经度"
                        dataIndex="longitude"
                        key="longitude"
                    />

                    <Column
                        title="纬度"
                        dataIndex="latitude"
                        key="latitude"
                    />

                    <Column
                        title="人口容量"
                        dataIndex="capacity"
                        key="capacity"
                        render= { data => `${data} 人`  }
                    />

                    <Column
                        title="操作"
                        dataIndex="action"
                        key="action"
                        render={(text, record) => (
                            <span>
                                <a onClick={ e => this.showMap(record) }>地图</a>
                                <span className="ant-divider" />
                                <a onClick={ () => { this.handleGetResourcesClick(record) } }>物资储备</a>
                                <span className="ant-divider" />
                                <a onClick={ () => { this.handleAddResourcesClick(record);  } }>追加物资</a>
                            </span>
                        )}
                    />
                </Table>

                <Modal
                    visible={ this.state.innerMap.show }
                    title={ this.state.innerMap.name }
                    footer={ null }
                    onCancel={ e => this.setState({ innerMap: { show: false } }) }
                    width={720}>
                    <div ref="innerMap" style={{ width: '680px', height: '480px' }}></div>
                </Modal>

                <Modal
                    visible={ this.state.innerResources.show }
                    title="物资储备"
                    footer={ null }
                    onCancel={ e => this.setState({ innerResources: { show: false, placeResource: [] } }) }
                    width={720}>

                <Table
                    rowKey={ record => record.id }
                    pagination={ false }
                    dataSource={ this.state.placeResources }>

                    <Column
                        title="物资"
                        dataIndex="name"
                        key="name"
                    />

                    <Column
                        title="数量"
                        dataIndex="number"
                        key="number"
                    />

                    <Column
                        title="计量单位"
                        dataIndex="unit"
                        key="unit"
                    />
                </Table>
                </Modal>

                <Modal
                    visible={ this.state.showAddResourcesModal }
                    title={  `追加物资储备 -- ${this.state.addResourcesTargetName}` }
                    footer={ null }
                    onCancel={ e => this.setState({ showAddResourcesModal: false }) }
                    width={720}>

                    { this.state.showAddResourcesModal ? <ResourcesFormWrapper targetId={ this.state.addResourcesTargetId } units={ this.state.units} /> : null  }
                </Modal>

            </Spin>
        </div>);
    }
}



const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 14,
            offset: 6,
        },
    },
};

class ResourcesForm extends Component {

    constructor(props) {
        super(props);

        this.state = { spinning: false }
    }

    handleSubmit(e) {

        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({ spinning: true });

                values.place_id = this.props.targetId;

                POST(ADD_PLACE_RESOURCE_API.url, values).then(response => {

                    this.setState({ spinning: false });

                    if (response.ok) {
                        return response.json();
                    }

                    throw {name:'InternalException', message:'保存失败'};
                }).then(json => {
                    if (json.code === 200) {
                        message.success("添加物资成功");
                        this.props.form.setFieldsValue({ unit_id: null, number: null });
                        return;
                    }

                    throw json.message;
                }).catch(e => {
                    message.error(e.message);
                    this.setState({ spinning: false });
                });
            }
        });

    }

    render() {
        const { getFieldDecorator } = this.props.form;

        let options = this.props.units.map((unit, id) => {
            return <Option key={id} value={ unit.id.toString() }>{ `${unit.name} - ${unit.unit}` }</Option>;
        });

        return (<Spin tip="正在保存" spinning={ this.state.spinning }>
            <Form onSubmit={ this.handleSubmit.bind(this) }>
                <FormItem
                    {...formItemLayout}
                    label="物资名称"
                    hasFeedback
                >
                    { getFieldDecorator('unit_id', { rules:[{ required: true, message: '请选择物资名称' }]})(<Select>
                        { options }
                    </Select>) }
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="物资数量"
                    hasFeedback
                >
                    { getFieldDecorator('number', {rules: [{required: true, message: '请输入物资量'}]})(<Input />) }
                </FormItem>

                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">追加</Button>
                </FormItem>
            </Form>
        </Spin>);
    }
}

const ResourcesFormWrapper = Form.create()(ResourcesForm);

export default Place;
