import React, { Component } from 'react';
import { Form, Input, Spin, message, Select, Button } from 'antd';

import { GET_ALL_PLACES_API, CREATE_ROUTE_API, POST, GET } from '../../utils/api.js';

const Option = Select.Option;
const FormItem = Form.Item;


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

class AddRoute extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spinning: true,
            places: []
        };
    }

    componentDidMount() {

        this.setState({ spinning: true });

        GET(GET_ALL_PLACES_API.url).then(response => {

            if (response.ok) {
                return response.json();
            }

            throw "获取疏散点失败";
        }).then(json => {
            if (json.code !== 200) {
                throw "获取疏散点失败";
                return;
            }

            this.setState({
                places: json.places,
                spinning: false
            });

        }).catch(e => {
            this.setState({
                spinning: false
            });
            message.error("获取疏散点失败");
        });

    }

    spinning() {
        this.setState({ spinning: true });
    }

    unSpinning() {
        this.setState({ spinning: false });
    }

    render() {
        return (<Spin spinning={ this.state.spinning }>
            <h2>添加疏散路线</h2>
            <RouteFormWrapper places={ this.state.places }  spinning={ this.spinning.bind(this) } unSpinning={ this.unSpinning.bind(this) }  />
        </Spin>);
    }
}

class RouteForm extends Component {

    handleSubmit(e) {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.props.spinning();

                POST(CREATE_ROUTE_API.url, values).then(response => {

                    this.props.unSpinning();

                    if (response.ok) {
                        return response.json();
                    }

                    throw "保存失败";
                }).then(json => {
                    if (json.code === 200) {
                        message.success("添加疏散路线成功");
                        this.props.form.resetFields();
                        return;
                    }

                    message.error(json.message);
                    this.props.unSpinning();
                }).catch(e => {
                    message.error(e.message);
                    this.props.unSpinning();
                });
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        let options = this.props.places.map((place, index) => <Option value={ place.id.toString() } key={ index }>{ place.name }</Option>);

        return (
            <Form style={{ marginTop: '24px' }} onSubmit={ this.handleSubmit.bind(this) }>
            <FormItem
            {...formItemLayout}
            label="始发地"
            hasFeedback>

            { getFieldDecorator('departure_id', { rules: [
                { required: true, message: '请选择始发地' },
                { validator: (rule, value, callback)  => {
                    let values = this.props.form.getFieldsValue();

                    if (value === values.destination_id) {
                        callback(rule.message);
                    } else {
                        callback();
                    }

                }, message: '始发地与目的地不能相同'}
            ] })(<Select>{ options }</Select>) }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="目的地"
                hasFeedback>

            { getFieldDecorator('destination_id', { rules: [
                { required: true, message: '请选择目的地' },
                { validator: (rule, value, callback)  => {
                    let values = this.props.form.getFieldsValue();

                    if (value === values.departure_id) {
                        return callback(rule.message);
                    } else {
                        return callback();
                    }

                }, message: '始发地与目的地不能相同'}
            ] })(<Select>{ options }</Select>) }
            </FormItem>


            <FormItem  wrapperCol={{ span: 8, offset: 6 }}><Button type="primary" htmlType="submit">添加</Button></FormItem>
            </Form>);
    }
}

const RouteFormWrapper = Form.create()(RouteForm);

export default AddRoute;
