///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { random, floatRandom } from "@/mxthree/utils";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import { ContourLayerProps } from "@deck.gl/aggregation-layers/contour-layer/contour-layer";
import {  ContourLayer, MapboxLayer, Position } from "./index";

// 等值线图层
export function Mx_Deck_Contour_Map_Layer() {
    let map = MxMapBox.getMap();
    interface MapboxContourMapLayerDataType {
        coordinates: Position,
        weight: number,
    }
    
    const data: MapboxContourMapLayerDataType[] = []
  
    for (let index = 0; index < 2000; index++) {
        data.push({
            coordinates:  [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524)],
            weight: random(1, 6),
        })
    }   
    const props: MapboxLayerProps<MapboxContourMapLayerDataType> & ContourLayerProps<MapboxContourMapLayerDataType> = {
        id: 'Mx_Deck_Contour_Map_Layer',
        type: ContourLayer,
        data,
        // aggregation: 'SUM',
        cellSize: 15,
        contours: [
            {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
            {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
            {threshold: 5, color: [0, 255, 0], strokeWidth: 3, zIndex: 2},
            {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
        ],
        getPosition: d => d.coordinates,
        getWeight: d => d.weight,
        // gpuAggregation: true,
        // zOffset: 0.005,
        /* props inherited from Layer class */

        // autoHighlight: false,
        // coordinateOrigin: [0, 0, 0],
        // highlightColor: [0, 0, 128, 128],
        opacity: 1,
        pickable: true,
        visible: true,
        wrapLongitude: false,
        dataComparator() {
            return false
        }
    }

    const myDeckLayer = new MapboxLayer<MapboxContourMapLayerDataType>(props);
    map.addLayer(myDeckLayer);
}