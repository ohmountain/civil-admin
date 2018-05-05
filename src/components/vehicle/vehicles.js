import React, { Component } from 'react';
import { Spin, Table, message, Modal, Form, Select, Input, Button } from 'antd';

import { PAGINATION_VEHICLE_API,UPDATE_VEHICLE_API, GET, POST } from '../../utils/api.js';

const { Column } = Table;
const FormItem   = Form.Item;
const Option     = Select.Option;

class Vehicle extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spinning: false,
            pagination: {
                page: 1,
                count: 20,
                total: 0,
                data: []
            },

            showModal: false,
            targetRecord: {}
        }
    }

    componentDidMount() {
        this.requestData(this.state.pagination.page, this.state.pagination.count);
    }

    requestData(page = 1, count = 20) {

        this.setState({ spinning: true });

        GET(`${PAGINATION_VEHICLE_API.url}?page=${page}&count=${count}`).then(response => {
            if (response.ok) {
                return response.json();
            }

            this.setState({ spinning: false });
            throw "获取车辆信息失败";
        }).then(json => {

            if (json.code !== 200) {
                this.setState({ spinning: false });
                throw json.message;
                return;
            }

            this.setState({
                spinning: false,
                pagination: {
                    page,
                    count,
                    total: json.data.max_count,
                    data:  json.data.vehicles
                }
            });

            message.success("获取成功");
        }).catch(e => {
            this.setState({ spinning: false });
            message.error(e.message);
        });
    }

    handleEditSuccess(record) {
        let pagination = this.state.pagination;
        let vehicles   = pagination.data;

        vehicles.map((vehicle, i) => {
            if (vehicle.id === record.id) {
                vehicles[i] = record;
                return;
            }
        });

        pagination.data = vehicles;

        this.setState({ pagination });
    }

    handleToBeEdit(record) {
        this.setState({
            showModal: true,
            targetRecord: record
        });
    }

    render() {
        return (<Spin spinning={this.state.spinning}>
            <Table
                dataSource={ this.state.pagination.data }
                rowKey={ r => r.id }
                pagination={{
                    defaultCurrent: this.state.pagination.page,
                    total: this.state.pagination.total,
                    pageSize: this.state.pagination.count,
                    onChange: this.requestData.bind(this)
                }}>
                <Column
                    title="车牌号"
                    dataIndex="license"
                    key="license"
                />

                <Column
                    title="车辆类型"
                    dataIndex="type"
                    key="type"
                />

                <Column
                    title="所有人(单位)"
                    dataIndex="owner"
                    key="owner"
                />

                <Column
                    title="状态"
                    dataIndex="status"
                    key="status"
                    render={ r => {
                            switch (parseInt(r)) {
                                case 1: return "空闲";
                                case 2: return "繁忙";
                                case 3: return "故障";
                                default: return "未知";
                            }
                    } }
                />

                <Column
                    title="存正哈希"
                    dataIndex="cert_hash"
                    key="cert_hash"
                    render={ r => r ? r : '暂无' }
                />

                <Column title="操作" key="action" render={ record => <a onClick={ () => this.handleToBeEdit(record) }>修改</a> } />

            </Table>

            <Modal title={`修改 - ${this.state.targetRecord.license ? this.state.targetRecord.license : ''}`} visible={ this.state.showModal } onCancel={ e => this.setState({ showModal: false, targetRecord: {} }) } footer={ null }>
                { this.state.showModal ? <VehicleFormWrapper vehicle={ this.state.targetRecord } onSuccess={ this.handleEditSuccess.bind(this) } /> : null }
            </Modal>
        </Spin>);
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

class VehicleForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spinning: false
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({ spinning: true });

                values.id = this.props.vehicle.id;

                POST(UPDATE_VEHICLE_API.url, values).then(response => {

                    if (response.ok) {
                        return response.json();
                    }

                    this.setState({ spinning: false});
                    throw new Error('修改失败');
                }).then(json => {
                    this.setState({ spinning: false });
                    if (json.code === 200) {
                        message.success("修改成功");
                        this.props.onSuccess(values);
                        this.props.form.resetFields();
                        return;
                    }

                    message.error(json.message);
                }).catch(e => {
                    this.setState({ spinning: false });
                    message.error(e.message);
                });
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (<Spin spinning={ this.state.spinning }><Form onSubmit={ this.handleSubmit.bind(this) }>
            <FormItem
                {...formItemLayout}
                label="车牌号码"
                hasFeedback
            >
                { getFieldDecorator('license', { rules: [{ required: true, message: '请输入车牌号码' }], initialValue: this.props.vehicle.license })(<Input disabled={true}  readOnly={true} placeholder="例如：贵A00000X" />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆类型"
                hasFeedback
            >
                { getFieldDecorator('type', { rules: [{ required: true, message: '请输入车辆类型' }], initialValue: this.props.vehicle.type  })(<Input placeholder="例如：五菱宏光" />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆所有人(单位)"
                hasFeedback
            >
                { getFieldDecorator('owner', { rules: [{ required: true, message: '请输入车辆所有人(单位)' }], initialValue: this.props.vehicle.owner })(<Input />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
  disabled={true}                label="车辆状态"
                hasFeedback
            >
                { getFieldDecorator('status', { rules: [{ required: true, message: '请选择车辆状态' }], initialValue: this.props.vehicle.status ? this.props.vehicle.status.toString() : '1' })(<Select>
                    <Option value="1">空闲</Option>
                    <Option value="2">繁忙</Option>
                    <Option value="3">故障</Option>
                </Select>)  }
            </FormItem>

            <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">修改</Button>
            </FormItem>
        </Form></Spin>);
    }
}

const VehicleFormWrapper =Form.create()(VehicleForm);

export default Vehicle;
