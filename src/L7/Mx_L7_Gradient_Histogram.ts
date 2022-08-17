
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { floatRandom, random } from "@/mxthree/utils";
import * as L7 from "./index"
import * as turf from "@turf/turf"

// 渐变柱状图
export default async function Mx_L7_Gradient_Histogram() {
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    let datas = []
    
    const bound = scene.getBounds()
    for (let i = 0; i < 500; i++) {
        let pt = [floatRandom(bound[0][0], bound[1][0]), floatRandom(bound[0][1], bound[1][1])];
        datas.push(pt)
    }

    const pointLayer = new L7.PointLayer({})
    .source(turf.points(datas))
    .shape('cylinder')
    .size('index', () =>  {
        return [ 5, 5, random(1, 100) ];
    })
    .animate(true)
    .active(true)
    .color('#006CFF')
    .style({
        opacity: 0.8,
        sourceColor: 'red',
        targetColor: 'yellow',
        lightEnable: false
    });
    pointLayer.on('click', e => {
        const popup = new L7.Popup({
            offsets: [ 0, 0 ],
            closeButton: false
        })
        .setLnglat(e.lngLat)
        .setHTML(`<span> featureId: ${e.featureId} </span>`);
        scene.addPopup(popup);
    });
    scene.addLayer(pointLayer);
}