import React, { Component } from 'react';
import { Spin, Modal, Input, message } from 'antd';
import { CREATE_PLACE_API, POST } from './../../utils/api.js';

const { BMap } = window;

class AddPlace extends Component {

    constructor(props) {
        super(props);

        this.state = {
            map: null,
            point: null,       // 经纬度
            name: null,        // 地名
            capacity: 0,       // 人口容量
            spinning: false    // 页面失手正在一步获取数据
        };
    }

    componentDidMount() {

        this.refs.container.style.height = this.refs.container.parentNode.parentNode.parentNode.parentNode.offsetHeight - 48 +  'px';

        var map = new BMap.Map(this.refs.container);
        var point = new BMap.Point(106.691194,26.576064);
        map.centerAndZoom(point, 15);
        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());
        map.addControl(new BMap.MapTypeControl());

        map.addEventListener('click', this.handleMapClick.bind(this));

        const ac = new BMap.Autocomplete({"input" : this.refs.search_box, "location" : map});
        ac.addEventListener('onconfirm', this.handleAcPlace.bind(this));

        this.setState({
            map: map,
            ac: ac
        });

    }

    handleMapClick(e) {
        let point = new window.BMap.Point(e.point.lng, e.point.lat);
        let marker = new window.BMap.Marker(point);
        marker.enableDragging();
        marker.addEventListener('dragend', this.handleMarkerDragend.bind(this));
        this.state.map.clearOverlays();
        this.state.map.addOverlay(marker);               // 将标注添加到地图中

        Modal.confirm({
            title: '确定选取坐标？',
            content: `${e.point.lng}, ${e.point.lat}`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => { this.handleConfirmPoint(e.point); }
        });

    }

    handleAcPlace(e) {
        var _value = e.item.value;
		    var value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;


        this.state.map.clearOverlays();

        const myFun = () => {
            var pp = local.getResults().getPoi(0).point;
			      this.state.map.centerAndZoom(pp, 15);

            const marker = new BMap.Marker(pp);
            marker.enableDragging();
            marker.addEventListener('dragend', this.handleMarkerDragend.bind(this));

			      this.state.map.addOverlay(marker);    //添加标注

            Modal.confirm({
                title: '确定选取坐标？',
                content: `${pp.lng}, ${pp.lat}`,
                okText: '确认',
                cancelText: '取消',
                onOk: () => { this.handleConfirmPoint(pp, this.refs.search_box.value); }
            });
        };

        var local = new BMap.LocalSearch(this.state.map, { //智能搜索
		        onSearchComplete: myFun
		    });

        local.search(value);
    }

    handleConfirmPoint(point, name = null) {
        Modal.confirm({
            title: "详细地址",
            content: (() => {
                return (
                        <Input
                            placeholder="请输入详细地址"
                            onChange={ e => { this.setState({ name: e.target.value }) } }
                        />);
            })(),
            okText: "确定",
            onOk: this.handleInputCapacity.bind(this)
        });

        this.setState({
            point,
            name
        });
    }

    handleInputCapacity() {

        if (!this.state.name) {
            message.error("请输入详细地址");
            this.handleConfirmPoint(this.state.point);
            return;
        }

        Modal.confirm({
            title: "人口容量",
            content: (() => {
                return (<Input placeholder="请输入人口容量" onChange={ e=> this.setState({ capacity: e.target.value }) }/>);
            })(),
            okText: "保存",
            onOk: this.handlePostPlace.bind(this)
        });

    }

    // post 地址信息到服务器
    handlePostPlace() {

        if (this.state.capacity < 1 || !/^\d+$/.test(this.state.capacity)) {
            this.handleInputCapacity();
            return;
        }

        this.setState({
            spinning: true
        });

        POST(CREATE_PLACE_API.url, {
            longitude: this.state.point.lng,
            latitude:  this.state.point.lat,
            capacity:  this.state.capacity,
            name: this.state.name
        }).then(response => {

            this.setState({
                point: null,
                capacity: null,
                name: null,
                spinning: false
            });

            this.state.map.clearOverlays();

            if (response.ok) {
                return response.json();
            }

            throw "添加失败";

        }).then(json => {
            if (json.code === 200) {
                message.success("添加成功，请在疏散点中查看");
                return;
            }

            throw json.message;
        }).catch(e => {
            message.error(e);
        });
    }

    handleMarkerDragend(e) {
        let pp = e.point;
        Modal.confirm({
            title: '确定选取坐标？',
            content: `${pp.lng}, ${pp.lat}`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => { this.handleConfirmPoint(pp, this.refs.search_box.value); }
        });
    }

    render() {
        return (<div className="map-container">
                <Spin size='large' spinning={ this.state.spinning }>
                <input ref="search_box" className="search_box" placeholder="快速查询位置" />
                <div ref="container"></div>
                </Spin>
        </div>);
    }
}

export default AddPlace;
