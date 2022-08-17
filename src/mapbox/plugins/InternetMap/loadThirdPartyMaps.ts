///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../../init";
const rasterTileLayer  = require('./rasterTileLayer-src.js')
let loadLayer: any[] = [];

// 加载地图图层
export function addRasterTileLayer(layerList: any[], key?: string) {
    let map = MxMapBox.getMap();
    loadLayer.forEach(function (layerId) {
        //删除已经加载的图层
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
        //删除已加载的数据源
        //天地图和OSM地图走的是mapboxgl的原生接口，在添加图层时会默认添加一个同名数据源，在删除图层时需要同时删除数据源
        //百度、高德、geoq地图走的是自定义图层，不会添加同名数据源
        if (map.getSource(layerId)) {
            map.removeSource(layerId);
        }
    });
    loadLayer = [];
    layerList.forEach(function (layer) {
        loadLayer.push(layer[0]);
        //调用接口，添加图层
        var param = key ? { key: key } : null;
        const mapLayer = rasterTileLayer(layer[0], layer[1], param);
        map.addLayer(mapLayer, 'mx.layer.fill');
    });
    
}

// 加载第三方地图
export const loadThirdPartyMaps = {
    /** 加载天地图普通地图 */
    tdtsl() {
        addRasterTileLayer(
            [
                ["tdtsl", "TianDiTu.Normal.Map"],
                ["tdtslzj", "TianDiTu.Normal.Annotion"],
            ],
            "fb258b4c0bbf60ff7a0205b519ad9a96"
        );
    },
    /** 天地图影像 */
    tdtyx() {
        addRasterTileLayer(
            [
                ["tdtyx", "TianDiTu.Satellite.Map"],
                ["tdtyxzj", "TianDiTu.Satellite.Annotion"],
            ],
            "fb258b4c0bbf60ff7a0205b519ad9a96"
        );
    },
    /** 天地图地形 */
    tdtdx() {
        addRasterTileLayer(
            [
                ["tdtdx", "TianDiTu.Terrain.Map"],
                ["tdtdxzj", "TianDiTu.Terrain.Annotion"],
            ],
            "fb258b4c0bbf60ff7a0205b519ad9a96"
        );
    },

    /** 高德矢量 */
    gdsl() {
        addRasterTileLayer([["gdsl", "GaoDe.Normal.Map"]]);
    },
    /** 高德矢量,无注记版 */
    gdslwzj() {
        addRasterTileLayer([["gdslwzj", "GaoDe.Normal_NoTag.Map"]]);
    },
    /** 高德影像*/
    gdyx() {
        addRasterTileLayer([
            ["gdyx", "GaoDe.Satellite.Map"],
            ["gdyxzj", "GaoDe.Satellite.Annotion"],
        ]);
    },

    /** 百度矢量*/
    bdsl() {
        addRasterTileLayer([["bdsl", "Baidu.Normal.Map"]]);
    },
    /** 百度影像*/
    bdyx() {
        addRasterTileLayer([
            ["bdyx", "Baidu.Satellite.Map"],
            ["bdyxzj", "Baidu.Satellite.Annotion"],
        ]);
    },

    /** OSM地图 */
    osm() {
        addRasterTileLayer([["osm", "OSM.Normal.Map"]]);
    },

    /** GeoQ普通地图 */
    geoq() {
        addRasterTileLayer([["geoq", "Geoq.Normal.Map"]]);
    },
    /** GeoQ深蓝色地图 */
    geoqPurplishBlue() {
        addRasterTileLayer([["geoqPurplishBlue", "Geoq.Normal.PurplishBlue"]]);
    },
    /** GeoQ浅色地图 */
    geoqGray() {
        addRasterTileLayer([["geoqGray", "Geoq.Normal.Gray"]]);
    },
    /** GeoQ暖色调地图 */
    geoqWarm() {
        addRasterTileLayer([["geoqWarm", "Geoq.Normal.Warm"]]);
    },
    /** GeoQ冷色调地图 */
    geoqCold() {
        addRasterTileLayer([["geoqCold", "Geoq.Normal.Cold"]]);
    },
}