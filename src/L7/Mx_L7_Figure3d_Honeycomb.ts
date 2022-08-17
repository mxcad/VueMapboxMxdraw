
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { floatRandom } from "@/mxthree/utils";
import * as L7 from "./index"

// 飞线线动画
export default async function Mx_L7_Figure3d_Honeycomb() {
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    let datas = []
    const bound = scene.getBounds()
    for (let i = 0; i < 500; i++) {
        let pt = [floatRandom(bound[0][0], bound[1][0]), floatRandom(bound[0][1], bound[1][1])];
        datas.push({
            x: pt[0],
            y: pt[1],
            v: Math.abs(Math.sin(pt[0] * pt[1])) * 200
        })
    }
    const layer = new L7.HeatmapLayer({})
        .source(datas, {
            parser: {
                type: 'json',
                x: 'x',
                y: 'y'
            },
            transforms: [
                {
                    type: 'hexagon',
                    size: 100,
                    field: 'v',
                    method: 'sum'
                }
            ]
        })
        .size('sum', sum => {
            return sum;
        })
        .shape('hexagonColumn')
        .style({
            coverage: 0.8,
            angle: 0,
            opacity: 1.0,
            
        })
        .color('sum', (sum) => {
            let color = "#33B5E5"
            if(sum > 100) {
                color = "#0099CC"
            }
            if(sum > 150) {
                color = "#AA66CC" 
            }
            if(sum > 200) {
                color = "#9933CC" 
            }
            if(sum > 250) {
                color = "#99CC00" 
            }
            if(sum > 300) {
                color = "#669900" 
            }
            if(sum > 350) {
                color = "#FFBB33" 
            }
            if(sum > 400) {
                color = "#CC0000"
            }
            return color;
        });
    scene.addLayer(layer);
}