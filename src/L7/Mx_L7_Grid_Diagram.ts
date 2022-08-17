
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { floatRandom, random } from "@/mxthree/utils";
import * as turf from "@turf/turf";
import * as L7 from "./index"

// 网格热力图
export default async function Mx_L7_Grid_Diagram() {
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    let datas = []

    const bound = scene.getBounds()
    for (let i = 0; i < 5000; i++) {
        let pt = [floatRandom(bound[0][0], bound[1][0]), floatRandom(bound[0][1], bound[1][1])];
        datas.push(pt)
    }
    const sourceData = turf.points(datas)
    sourceData.features = sourceData.features.map((feature) => {
        feature.properties = {
            "capacity": random(1, 100)
        }
        return feature
    }) as any
    const layer = new L7.HeatmapLayer({})
        .source(sourceData, {
            transforms: [
                {
                    type: 'grid',
                    size: 50,
                    field: 'v',
                    method: 'sum'
                }
            ]
        })
        .shape('square')
        .style({
            coverage: 1,
            angle: 0
        })
        .color(
            'count',
            [
                '#8C1EB2',
                '#EDE59C'
            ].reverse()
        );
    scene.addLayer(layer);
}