
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

// 等值线图
export default async function Mx_L7_Contour() {
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    let datas = []
    
    const bound = scene.getBounds()
    for (let i = 0; i < 10; i++) {
        
        const len = random(5, 100)
        const lines = []
        for(let l = 0; l < len;l++) {
            let pt = [floatRandom(bound[0][0], bound[1][0]), floatRandom(bound[0][1], bound[1][1])];
            lines.push(pt)
        }
        datas.push(lines)
    }
    const sourceData = turf.lineStrings(datas)
    sourceData.features = sourceData.features.map((feature)=> {
        feature.properties = {
            "ELEV": random(1500, 1550)
        }
        return feature
    }) as any
    const layer = new L7.LineLayer({})
        .source(sourceData)
        .size('ELEV', h => {
            return [ h % 50 === 0 ? 1.0 : 0.5, (h - 1300) * 0.2 ];
        })
        .shape('line')
        .scale('ELEV', {
            type: 'quantize'
        })
        .color('ELEV', [
            '#094D4A',
            '#146968',
            '#1D7F7E',
            '#289899',
            '#34B6B7',
            '#4AC5AF',
            '#5FD3A6',
            '#7BE39E',
            '#A1EDB8',
            '#CEF8D6'
        ]);
    scene.addLayer(layer)
}

