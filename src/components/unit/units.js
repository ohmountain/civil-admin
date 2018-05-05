import React, { Component } from 'react';
import { Table, Icon, Pagination, Spin, message, Modal, Form, Input, Button } from 'antd';
import {
    PAGINATION_UNIT_API,
    GET,
    POST,
    CREATE_UNIT_API,
    UPDATE_UNIT_API,
} from '../../utils/api.js';
const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};

class Units extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spinning: true,
            pagination: {
                page: 1,
                count: 20,
                total: 0,
                data: []
            },
            innerResources: {
                show: false,
            },
            modalAction: 'create',
            id: null,
            name: null,
            unit: null
        };
    }

    componentDidMount() {
        this.requestData(this.state.pagination.page, this.state.pagination.count);
    }

    requestData(page=1, count=20) {
        let url= `${PAGINATION_UNIT_API.url}?page=${page}&count=${count}`;

        this.setState({ spinning: true });

        GET(url).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw response.mesage;
        }).then(json => {
            if (json.code === 200) {
                this.setState({
                    pagination: {
                        page,
                        count,
                        total: json.data.max_count,
                        data: json.data.units,
                    },
                    spinning: false
                });
                message.success("获取成功");
            } else {
                throw json.message;
            }
        }).catch(e => {
            message.error(e.message);
            this.setState({ spinning: false });
        });
    }

    closeModal() {
        this.setState({ innerResources: { show: false } });
    }

    afterTableUpdate(name, unit) {
        let pagination = this.state.pagination;
        let data = pagination.data;

        data.forEach((d, i) => {
            if (d.id === this.state.id) {
                data[i].name = name;
                data[i].unit = unit;
            }
        });

        this.setState({
            pagination: {...pagination, data}
        });
    }

    render() {
        return <div>
            <Spin spinning={ this.state.spinning }>
                <div style={{ marginBottom: '16px' }}><span className="fa fa-plus" style={{
                    height: '32px',
                    width: '32px',
                    lineHeight: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0'
                }} onClick={ e => this.setState({ innerResources: { show: true } })  }></span></div>
                <Table
                    dataSource={ this.state.pagination.data } rowKey={ r => r.id }
                    pagination={{
                        defaultCurrent: this.state.pagination.page,
                        total: this.state.pagination.total,
                        pageSize: this.state.pagination.count,
                        onChange: this.requestData.bind(this)
                    }}
                >
                    <Column
                        title="物资名称"
                        dataIndex="name"
                        key="name"
                    />

                    <Column
                        title="计量单位"
                        dataIndex="unit"
                        key="unit"
                    />

                    <Column
                        title="存正哈希"
                        dataIndex="cert_hash"
                        key="cert_hash"
                        render={ hash => {
                                if (hash == null) {
                                    return '暂无';
                                }

                                return hash;
                        }}
                    />

                    <Column
                        title="创建时间"
                        dataIndex="created_at"
                        key="created_at"
                    />
                    <Column
                        title="更新时间"
                        dataIndex="updated_at"
                        key="updated_at"
                    />

                    <Column
                        title="操作"
                        key="actions"
                        render={ record => {
                                return  <span><a onClick={ e => {
                                        this.setState({
                                            modalAction: 'update',
                                            id: record.id,
                                            name: record.name,
                                            unit: record.unit,
                                            innerResources: {
                                                show: true
                                            }
                                        });
                                } }>修改</a></span>
                        }}
                    />

                </Table>


                <Modal
                    visible={ this.state.innerResources.show }
                    title={ this.state.modalAction === 'create' ? "添加物资计量单位" : "更新物资计量单位" }
                    footer={ null }
                    onCancel={ e => this.setState({ innerResources: { show: false }, modalAction: 'create' }) }
                    width={720}>

                    { this.state.innerResources.show ? <UnitFormWrapper
                                                           id={ this.state.id }
                                                           name={ this.state.name }
                                                           unit={ this.state.unit }
                                                           action={ this.state.modalAction }
                                                           closeModal={ this.closeModal.bind(this) }
                                                           afterTableUpdate={ this.afterTableUpdate.bind(this) } /> : null }
                </Modal>

            </Spin>
        </div>;
    }
}

class UnitForm extends Component {

    constructor(props) {
        super(props);
        this.state = { spinning: false };
    }


    componentDidMount() {

        const { props } = this;

        if (props.action === 'update') {
            props.form.setFieldsValue({
                name: props.name,
                unit: props.unit
            });
        }
    }

    handleSubmit(e) {

        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({ spinning: true });

                if (this.props.action === 'create') {
                    POST(CREATE_UNIT_API.url, values).then(response => {

                        this.setState({ spinning: false });

                        if (response.ok) {
                            return response.json();
                        }

                        throw "保存失败";
                    }).then(json => {
                        this.props.closeModal();
                        if (json.code === 200) {
                            message.success("保存成功，请刷新页面");
                            this.props.form.setFieldsValue({ name: null, unit: null });
                            return;
                        }

                        throw json.message;
                    }).catch(e => {
                        message.error(e.message);
                        this.props.closeModal();
                        this.setState({ spinning: false });
                    });
                } else {

                    let data = Object.assign({id: this.props.id}, values);

                    POST(UPDATE_UNIT_API.url, data).then(response => {

                        this.props.closeModal();
                        this.setState({ spinning: false });

                        if (response.ok) {
                            return response.json();
                        }

                        throw "保存失败";
                    }).then(json => {
                        if (json.code === 200) {
                            message.success("保存成功");
                            this.props.form.setFieldsValue({ name: null, unit: null });
                            this.props.afterTableUpdate(values.name, values.unit);
                            return;
                        }

                        throw json.message;
                    }).catch(e => {
                        message.error("更新失败!");
                        this.props.closeModal();
                        this.setState({ spinning: false });
                    });

                }
            }
        });

    }

    render() {
        const { getFieldDecorator } = this.props.form;

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

        return (<Spin tip="正在保存" spinning={ this.state.spinning }><Form onSubmit={ this.handleSubmit.bind(this) }>
            <FormItem
                {...formItemLayout}
                label="物资名称"
                hasFeedback
            >
                { getFieldDecorator('name', {rules: [{required: true, message: '请输入物资名称'}]})(<Input />) }
            </FormItem>

            <FormItem
                {...formItemLayout}
                label="物资单位"
                hasFeedback
            >
                { getFieldDecorator('unit', {rules: [{required: true, message: '请输入物资单位'}]})(<Input />) }
            </FormItem>

            <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">{ this.props.action === 'create' ? '创建' : '更新' }</Button>
            </FormItem>
        </Form></Spin>);
    }
}

const UnitFormWrapper = Form.create({ target: 'create' })(UnitForm);

export default Units;
