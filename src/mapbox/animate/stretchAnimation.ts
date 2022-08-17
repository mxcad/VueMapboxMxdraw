
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
import { addAnimation, createAnimation, interpolate, removeAnimation } from "../animate";
import { random, floatRandom } from "@/mxthree/utils";

// 拉伸动画
export function stretchAnimation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    //  根据地图范围随机生成多边形
    const polygons = turf.randomPolygon(100, {bbox, num_vertices: 3, max_radial_length: 0.002})
    polygons.features = polygons.features.map((feature)=> {
        feature.properties.color = [random(0, 255), random(0, 255), random(0, 255)]
        feature.properties.color2 = [random(0, 255), random(0, 255), random(0, 255)]
        feature.properties.height = random(300, 1000)
        feature.properties.baseHeight = 0
        return feature
    })
    // 多边形拉伸图层
    map.addLayer({
        id: "stretchAnimation",
        type: "fill-extrusion",
        source: {
            type: "geojson",
            data: polygons
        },
        paint: {
            "fill-extrusion-color": ['get', 'color'],
            "fill-extrusion-base": ['get', 'baseHeight'],
            "fill-extrusion-opacity": 0.8,
            "fill-extrusion-height": ['get', 'height'],
        }
    })

    // 克隆初始化数据
    const initData = turf.clone(polygons)
    const source = map.getSource('stretchAnimation') as any

    // 得到插值函数
    const mapProgressToValues = (idx:number) => interpolate(
        [0, 1],
        [
            { color: initData.features[idx].properties.color, height: 0 },
            { color: initData.features[idx].properties.color2, height: initData.features[idx].properties.height },
        ]
    )
    // 创建动画
    const animate =  createAnimation({
        onUpdate(latest) {
            for(let i = 0 ; i < polygons.features.length; i++) {
                const value = mapProgressToValues(i)(latest)
                polygons.features[i].properties.color = value.color;
                polygons.features[i].properties.height = value.height;
            }
            source.setData(polygons)
        }
    })
    map.on('remove', ()=> {
        animate.remove()
    })
    
}