import React, { Component } from 'react';
import { Spin, Form, message, Select, Input, InputNumber, Button, DatePicker, Table, Icon, Row, Col, Modal } from 'antd';
import {
    GET_ALL_UNIT_API,
    GET_ALL_VEHICLES_API,
    GET_ALL_ROUTES_WITH_PLACE_API,
    GET,

    CREATE_EVACUATION_API,
    POST
} from '../../utils/api.js';

const FormItem   = Form.Item;
const { Option } = Select;
const RangePicker = DatePicker.RangePicker;

class AddEvacuation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spinning: true,
            routes: [],
            vehicles: []
        };
    }

    componentDidMount() {
        GET(GET_ALL_ROUTES_WITH_PLACE_API.url).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("获取路线失败!");
        }).then(json => {
            if (json.code === 200) {
                this.setState({
                    routes: json.routes,
                    spinning: this.state.vehicles.length > 0 ? false: true
                });
            }
        }).catch(e => {
            message.error(e.message);

            this.setState({ spinning: false });
        });

        GET(GET_ALL_VEHICLES_API.url).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("获取路线失败!");
        }).then(json => {
            if (json.code === 200) {
                this.setState({
                    vehicles: json.vehicles,
                    spinning: this.state.routes.length > 0 ? false: true
                });
            }
        }).catch(e => {
            message.error(e.message);

            this.setState({ spinning: false });
        });

    }

    render() {
        return (<Spin spinning={ this.state.spinning }>
            <h2 style={{ marginBottom: '48px' }}>添加疏散计划</h2>
            <EvaucationFormWrapper routes={ this.state.routes } vehicles={ this.state.vehicles }  />
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

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 6 },
    },
};

function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

class EvaucationForm extends Component {

    state = {
        showModal: false,
        units: [],
        resources: []
    };


    columns = [{
        title: '物资名称',
        dataIndex: 'name',
        key: 'name'
    }, {
        title: '物资数量',
        dataIndex: 'number',
        key: 'number'
    }, {
        title: '计量单位',
        dataIndex: 'unit',
        key: 'unit'
    }, {
        title: '操作',
        render: record => (<a onClick={ () => { this.removeResource(record) }}>删除</a>)
    }];

    componentDidMount() {
        this.getAllUinits();
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }

            let resources = new Object();

            this.state.resources.map(r => {
                resources[r.id] = r.number;
            });

            resources = JSON.stringify(resources);

            let start_time  = values.evacuation_time[0].format("X");        // unix time
            let finish_time = values.evacuation_time[1].format("X");        // unix time

            let data = Object.assign({}, values, { resources }, { start_time, finish_time });

            delete data.evacuation_time;

            this.postEvacuation(data);
        });
    }

    postEvacuation(data) {
        POST(CREATE_EVACUATION_API.url, data).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("添加疏散计划失败!");
        }).then(json => {
            if (json.code === 200) {
                message.success("添加疏散计划成功!");
                this.props.form.resetFields();
                this.setState({ resources: [] });
                return;

                setTimeout(() => { window.location.reload() }, 1000);
            }

            throw new Error(json.message);
        }).catch(e => {
            message.error(e.message);
        });
    }

    disabledDate(current) {
        // Can not select days before today
        return current && current.valueOf() + 3600 * 24 < Date.now();
    }

    showModal() {
        this.setState({ showModal: true });
    }

    removeResource(record) {
        let resources = this.state.resources.filter(resource => resource.id != record.id);

        this.setState({ resources });
    }

    addResource(id, number) {
        if (number === 0) {
            return;
        }

        let target    = null;
        let resources = this.state.resources;

        let targetIndex = resources.findIndex(r => r.id == id);

        if (targetIndex > -1) {
            target = resources[targetIndex];
        }

        let unit =  this.state.units[this.state.units.findIndex(u => u.id === id)];

        if (target != null) {
            resources[targetIndex]['number'] += number;
        } else {
            target = {
                id: unit.id,
                name: unit.name,
                unit: unit.unit,
                number
            };

            resources.push(target);
        }

        this.setState({ resources });
    }

    getAllUinits() {
        GET(GET_ALL_UNIT_API.url).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("获取物资单位失败");
        }).then(json => {
            if (json.code === 200) {
                this.setState({ units: json.units });
                return;
            }

            throw new Error(json.message);
        }).catch(e => {
            message.error(e.message)
        });
    }

    render() {

        const { getFieldDecorator } = this.props.form;
        const { routes } = this.props;
        const { vehicles } = this.props;

        const rangeConfig = {
            rules: [{ type: 'array', required: true, message: '请选择疏散时间'}],
        };

        let _routes = routes.map((route) => {
            return (<Option value={ route.route_id.toString() } key={ route.route_id }>
                {route.departure_name}({route.departure_latitude}, {route.departure_longitude}) - {route.destination_name}({route.destination_latitude}, {route.destination_longitude})
            </Option>);
        });

        let _vehicles = vehicles.map(vehicle => {
            return <Option value={ vehicle.id.toString() } key={ vehicle.id } disabled={ vehicle.status === 1 ? false : true }>{ vehicle.type } - { vehicle.license } - { vehicle.owner }</Option>;
        });

        return (<Form onSubmit={ this.handleSubmit.bind(this) }>
            <FormItem
                {...formItemLayout}
                label="疏散人数"
                hasFeedback
            >
                { getFieldDecorator('peoples', { rules: [{ required: true, message: '请输入疏散人数' }, { pattern: /^[1-9]+(\d+)?$/, message: '人数必须是大于0的整数' }] })(<Input placeholder="请输入疏散人数" />)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="疏散时间"
                hasFeedback
            >
                {getFieldDecorator('evacuation_time', rangeConfig)(<RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabledDate={ this.disabledDate.bind(this) } />)}
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="车辆"
                hasFeedback
            >
                { getFieldDecorator('vehicle_id', { rules: [{ required: true, message: '请选择疏散车辆' }] })(<Select placeholder="请选择疏散车辆">{ _vehicles }</Select>)  }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="疏散路线"
                hasFeedback
            >
                { getFieldDecorator('route_id', { rules: [{ required: true, message: '请选择疏散路线' }] })(<Select placeholder="请选择疏散路线">{ _routes }</Select>)  }
            </FormItem>

            <FormItem { ...formItemLayout } label="物资列表">
                <Table rowKey={ r=>r.id } columns={ this.columns } dataSource={ this.state.resources } pagination={ false }/>
            </FormItem>

            <FormItem {...formItemLayoutWithOutLabel} style={{ paddingTop: '24px' }}>
                <Button type="dashed" onClick={ this.showModal.bind(this) } style={{ width: '60%' }}>
                    <Icon type="plus" /> 添加物资
                </Button>
            </FormItem>

            <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">保存疏散计划</Button>
            </FormItem>

            <Modal title="添加物资" visible={ this.state.showModal } footer={ null } onCancel={ () => { this.setState({ showModal: false }) } }>
                { this.state.showModal ? <ResourcesFormWrapper units={ this.state.units } addResource={ this.addResource.bind(this) } /> : null }
            </Modal>
        </Form>);
    }
}

const EvaucationFormWrapper = Form.create()(EvaucationForm);


class ResourcesForm extends Component {

    handleSubmit(e) {

        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.addResource(parseInt(values.unit_id), parseInt(values.number));
                this.props.form.resetFields();
            }
        });

    }

    render() {
        const { getFieldDecorator } = this.props.form;

        let options = this.props.units.map((unit, id) => {
            return <Option key={id} value={ unit.id.toString() }>{ `${unit.name} - ${unit.unit}` }</Option>;
        });

        return (
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
                    { getFieldDecorator('number', {rules: [{required: true, message: '请输入物资量'}]})(<InputNumber min={ 0 } />) }
                </FormItem>

                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">添加物资</Button>
                </FormItem>
            </Form>);
    }
}

const ResourcesFormWrapper = Form.create()(ResourcesForm);


export default AddEvacuation;
