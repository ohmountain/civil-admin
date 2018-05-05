import React, { Component } from 'react';
import { Table, message, Spin } from 'antd';

import { PAGINATION_ROUTES_API, GET } from '../../utils/api.js';

const Column = Table.Column;


class Routes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spining: true,
            data: [],
            pagination: {
                page: 1,
                total: 0,
                pageSize: 20
            }
        };
    }

    requestData(page = 1, count = 20) {

        this.setState({
            spining: true
        });

        GET(`${PAGINATION_ROUTES_API.url}?page=${page}&count=${count}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }

                throw "获取失败";
            }).then(json => {
                if (json.code != 200) {
                    throw json.message;
                }

                this.setState({
                    spining: false,
                    data: json.data.routes,
                    pagination: {
                        page,
                        total: json.data.max_count,
                        pageSize: count
                    }
                });

                message.success("获取成功");

            }).catch(e => {
                message.error(e.message);
            });
    }

    componentDidMount() {
        this.requestData(this.state.pagination.page, this.state.pagination.pageSize);
    }

    handlePageChange(page, pageSize) {
        this.requestData(page, pageSize);
    }

    render() {
        return <Spin spinning={ this.state.spining }>
            <Table
                dataSource={ this.state.data }
                rowKey={ record => record.id }
                pagination={{
                    defaultCurrent: this.state.pagination.page,
                    total: this.state.pagination.total,
                    pageSize: this.state.pagination.pageSize,
                    onChange: this.handlePageChange.bind(this)
                }}
            >
                <Column
                    title="始发地"
                    dataIndex="departure.name"
                    key="departure"
                />

                <Column
                    title="目的地"
                    dataIndex="destination.name"
                    key="destination"
                />

                <Column
                    title="存正哈希"
                    dataIndex="cert_hash"
                    key="cert_hash"
                    render={ r => r ? r : '暂无' }
                />
            </Table>
        </Spin>;
    }
}

export default Routes;
