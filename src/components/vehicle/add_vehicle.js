import React, { Component } from 'react';
import { Form, Spin, Input, Select, Button, message } from 'antd';

import { POST, CREATE_VEHICLE_API } from '../../utils/api.js';

const FormItem = Form.Item;
const Option   = Select.Option;

class AddVehicle extends Component {

    render() {
        return (<div>
            <h2 style={{ marginBottom: '48px' }}>添加车辆信息</h2>
            <VehicleFormWrapper />
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

class VehicleForm extends Form {

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

                POST(CREATE_VEHICLE_API.url, values).then(response => {

                    if (response.ok) {
                        return response.json();
                    }

                    this.setState({ spinning: false});
                    throw {name: 'NotFoundException', message: "保存失败"};
                }).then(json => {
                    this.setState({ spinning: false });
                    if (json.code === 200) {
                        message.success("添加车辆成功");
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
                { getFieldDecorator('license', { rules: [{ required: true, message: '请输入车牌号码' }] })(<Input placeholder="例如：贵A00000X" />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆类型"
                hasFeedback
            >
                { getFieldDecorator('type', { rules: [{ required: true, message: '请输入车辆类型' }] })(<Input placeholder="例如：五菱宏光" />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆所有人(单位)"
                hasFeedback
            >
                { getFieldDecorator('owner', { rules: [{ required: true, message: '请输入车辆所有人(单位)' }] })(<Input />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆状态"
                hasFeedback
            >
                { getFieldDecorator('status', { rules: [{ required: true, message: '请选择车辆状态' }], initialValue: '1' })(<Select>
                    <Option value="1">正常</Option>
                    <Option value="2">繁忙</Option>
                    <Option value="3">故障</Option>
                </Select>)  }
            </FormItem>

            <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">添加</Button>
            </FormItem>
        </Form></Spin>);
    }
}

const VehicleFormWrapper = Form.create()(VehicleForm);

export default AddVehicle;
