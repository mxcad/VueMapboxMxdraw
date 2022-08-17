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
import {  ScenegraphLayer, MapboxLayer, Position3D } from "./index";
import { ScenegraphLayerProps } from "@deck.gl/mesh-layers/scenegraph-layer/scenegraph-layer"
import { floatRandom } from "@/mxthree/utils";
// 场景图层
export function Mx_Deck_Scenario_Layer() {
    let map = MxMapBox.getMap();
    const data:DataInfo[] = [];
    for(let i = 0; i < 100; i++) {
        data.push({
            position: [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524), 0]
        })
    }

    interface DataInfo {
        position: Position3D
    }
    const props: MapboxLayerProps<DataInfo> & ScenegraphLayerProps<DataInfo> = {
        id: 'Mx_Deck_Point_Cloud_Layer',
        type: ScenegraphLayer as any,
        data,
        pickable: true,
        scenegraph: "./model/BoxAnimated.glb" as unknown as URL,
        getPosition: d => d.position,
        getOrientation: d => [0, Math.random() * 180, 90],
        _animations: {
        '*': {speed: 5}
        },
        sizeScale: 10,
        _lighting: 'pbr'
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
  
}