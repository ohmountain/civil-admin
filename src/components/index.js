import React, { Component } from 'react';
import Icon  from 'react-fontawesome';

import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

import Home from './home/home.js';
import Places from './place/places.js';
import AddPlace from './place/add_place.js';
import Units from './unit/units.js';
import Routes from './route/routes.js';
import AddRoute from './route/add_route.js';
import Vehicles from './vehicle/vehicles.js';
import AddVehicle from './vehicle/add_vehicle.js';
import Evacuation from './evacuation/evacuation.js';
import AddEvacuation from './evacuation/add_evacuation.js';

import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
require('./../../node_modules/font-awesome/css/font-awesome.min.css');

const { Sider, Content } = Layout;
const { SubMenu } = Menu;


class IndexComponent extends Component {

    constructor(props) {

        super(props);

        this.state = {
            collapsed: false,
        };
    }

    toggle() {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render() {
        return (
            <Router>
                <Layout>
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={this.state.collapsed}
                        style={{ minHeight: '100vh' }}
                    >
                        <Link to='/'><div className="logo" /></Link>

                        <Menu
                            defaultSelectedKeys={['sub1']}
                            defaultOpenKeys={['sub1']}
                            mode="inline"
                            theme="dark"
                            inlineCollapsed={this.state.collapsed}
                        >
                            <SubMenu key="sub1" title={<span><Icon name="map" /><span>地图</span></span>}>
                                <Menu.Item key="5"><Link to="/places"><Icon name="map-marker"/>疏散点</Link></Menu.Item>
                                <Menu.Item key="6"><Link to="/add_place"><Icon name="plus"/>添加疏散点</Link></Menu.Item>
                            </SubMenu>

                            <SubMenu key="sub2" title={<span><Icon name="random" /><span>疏散路线</span></span>}>
                                <Menu.Item key="9"><Link to="/routes"><Icon name="reorder"/> 路线列表</Link></Menu.Item>
                                <Menu.Item key="10"><Link to="/route/add"><Icon name="plus"/>新建路线</Link></Menu.Item>
                            </SubMenu>

                            <SubMenu key="sub3" title={<span><Icon name="spoon" /><span>物资储备</span></span>}>
                                <Menu.Item key="11"><Link to="/units"><Icon name="circle"/>物资单位表</Link></Menu.Item>
                            </SubMenu>

                            <SubMenu key="sub4" title={<span><Icon name="car" /><span>车辆管理</span></span>}>
                                <Menu.Item key="13"><Link to="/vehicles"><Icon name="list"/>车辆列表列表</Link></Menu.Item>
                                <Menu.Item key="14"><Link to="/vehicle/add"><Icon name="plus"/>添加车辆</Link></Menu.Item>
                            </SubMenu>

                            <SubMenu key="sub5" title={<span><Icon name="database" /><span>疏散管理</span></span>}>
                                <Menu.Item key="15"><Link to="/evacuations"><Icon name="list"/>疏散记录</Link></Menu.Item>
                                <Menu.Item key="16"><Link to="/evacuation/add"><Icon name="plus"/>添加疏散计划</Link></Menu.Item>
                            </SubMenu>

                            <SubMenu key="sub6" title={<span><Icon name="user" /><span>用户</span></span>}>
                                <Menu.Item key="17"><Icon name="users"/>用户列表</Menu.Item>
                                <Menu.Item key="18"><Icon name="plus"/>添加用户</Menu.Item>
                            </SubMenu>
                        </Menu>

                    </Sider>
                    <Layout>
                        {/* <Header style={{ background: '#fff' }}></Header> */}
                        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                            <Route exact path="/" component={Home} />
                            <Route path="/places" component={Places} />
                            <Route path="/add_place" component={AddPlace} />
                            <Route path="/units" component={Units} />
                            <Route path="/routes" component={Routes} />
                            <Route path="/route/add" component={AddRoute} />
                            <Route path="/vehicles" component={Vehicles} />
                            <Route path="/vehicle/add" component={AddVehicle} />
                            <Route path="/evacuations" component={Evacuation} />
                            <Route path="/evacuation/add" component={AddEvacuation} />
                        </Content>
                    </Layout>
                </Layout>
            </Router>
        );
    }
}

export default IndexComponent;
