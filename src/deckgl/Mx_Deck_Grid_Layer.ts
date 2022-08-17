///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import {  ScreenGridLayer, MapboxLayer, Position } from "./index";
import { ScreenGridLayerProps } from '@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-layer'
import { floatRandom, random } from "@/mxthree/utils";
// 场景图层
export function Mx_Deck_Grid_Layer() {
    let map = MxMapBox.getMap();
    interface DataInfo {
        coordinates: Position
        weight: number
    }
    const data:DataInfo[] = [];
    for(let i = 0; i < 2000; i++) {
        data.push({
            coordinates: [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524)],
            weight: random(1, 100)
        })
    }
    
    const props: MapboxLayerProps<DataInfo> & ScreenGridLayerProps<DataInfo> = {
        id: 'Mx_Deck_Grid_Layer',
        type: ScreenGridLayer,
        data,
        pickable: false,
        opacity: 0.8,
        cellSizePixels: 50,
        colorRange: [
            [0, 25, 0, 25],
            [0, 85, 0, 85],
            [0, 127, 0, 127],
            [0, 170, 0, 170],
            [0, 190, 0, 190],
            [0, 255, 0, 255]
        ],
        getPosition: d => d.coordinates,
        getWeight: d => d.weight
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
  
}