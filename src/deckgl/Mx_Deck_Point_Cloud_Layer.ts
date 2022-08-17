
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { MxMapBox, mapOrigin } from "@/mapbox";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import {  PointCloudLayer, PointCloudLayerProps, MapboxLayer, Position } from "./index";
import { RGBColor } from "@deck.gl/core/utils/color";
// 点云图层
export function Mx_Deck_Point_Cloud_Layer() {
   let map = MxMapBox.getMap();
    let data = "./model/pointcloud.json"
    interface DataInfo {
        color: RGBColor,
        normal: [number, number, number],
        position: Position
    }
    const props: MapboxLayerProps<DataInfo> & PointCloudLayerProps<DataInfo> = {
        id: 'Mx_Deck_Point_Cloud_Layer',
        type: PointCloudLayer,
        data,
        pointSize: 2,
        coordinateOrigin: mapOrigin,
        coordinateSystem: 2,
        pickable: false,
        getColor: d => d.color,
        getNormal: d => d.normal,
        getPosition: d => d.position.map(v=> v / 20) as Position,
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
  
}