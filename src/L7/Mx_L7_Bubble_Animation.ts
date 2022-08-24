
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import * as L7 from "./index"
import * as turf from "@turf/turf"
import { MxMapBox } from "@/mapbox"
// 气泡动画
export default async function Mx_L7_Bubble_Animation() {
    // 加载17.js
    await L7.init()
    const map = MxMapBox.getMap()
    const scene = L7.l7Scene
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(50, {bbox})
    points.features = points.features.map((feature, index)=> {
        feature.properties.index = index
        return feature
    })
    const pointLayer = new L7.PointLayer({})
    .source(points)
    .shape('circle')
    .active(true)
    .animate(true)
    .size(58)
    .color('index', (value) => {
        let idx = +value % 4;
        let colors = [
            "#4cfd47",
            "#00F8F9",
            "#FFFF00",
            "#FF0000"
        ];
        return colors[idx];
    })
    .style({
        opacity: 1
    });
  
    scene.addLayer(pointLayer);
}