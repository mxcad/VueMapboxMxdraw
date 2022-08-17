///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";
import * as turf from "@turf/turf"
import { random } from "@/mxthree/utils";

// 热力图
export function heatmapLayer(){
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(1000, {bbox})
    points.features = points.features.map(v=> {
        v.properties = {
            value: random(0, 100)
        }
        return v
    })
    map.addLayer({
        "id": "heatmapLayer",
        "type": "heatmap",
        "source": {
            type: "geojson",
            data: points
        },
        paint: {
            // 表示一个点对热力图权重的贡献，在贡献越大的地方热力图显示应该越明显
            "heatmap-weight":  [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                0, // 因为上面用了0,100，最小和最大值，把这两个最小和最大值归化到0,1区间
                0,
                100,
                1
            ],
             // 热力图的一个点计算权重的时候计算的点的半径，单位为像素，默认为30
             "heatmap-radius": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, //0级别
                1, //半径10
                24, // 9级别 (其余级别，线性插值)
                24 // 半径240
            ],
            // heatmapColor：热力图的颜色，设置在各个热力图的数值上是什么颜色
            "heatmap-color": [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)'
            ],
            // "heatmap-intensity": [
            //     'interpolate',
            //     ['linear'],
            //     ['zoom'],
            //     0,
            //     1,
            //     9,
            //     3
            // ],
            // "heatmap-opacity": [
            //     'interpolate',
            //     ['linear'],
            //     ['zoom'],
            //     7,
            //     1,
            //     9,
            //     0
            // ]
        }
    })
}