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
import { addAnimation, createAnimation, interpolatePointsByRatio, removeAnimation } from "../animate";
import { random } from "@/mxthree/utils";

// 多线段拉伸动画
export function multiSegmentStretchAnimation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 根据地图范围生成线段
    const lines = turf.randomLineString(5, { bbox, num_vertices: 3, max_length: 0.01 })
    // 将线段拉伸的数据
    const linePolygons = turf.featureCollection(lines.features.map((line, index) => {
        return turf.polygon([], {
            offset: 10,
            path: line,
            baseHeight: 0,
            color: `rgb(${random(0, 255)}, ${random(0, 255)},${random(0, 255)})`,
            height: random(100, 200)
        }, {
            id: index
        })
    }))


    map.addLayer({
        id: "multiSegmentStretchAnimation",
        type: "fill-extrusion",
        source: {
            type: "geojson",
            data: linePolygons
        },
        paint: {
            "fill-extrusion-base": ['get', 'baseHeight'],
            "fill-extrusion-color": ['case', ['to-boolean', ['feature-state', 'hover']], 'red', ['get', 'color']],
            "fill-extrusion-height": ['get', 'height'],
            "fill-extrusion-opacity": 0.8,
            "fill-extrusion-vertical-gradient": true
        }
    })

    // 克隆初始化数据
    const initData = turf.clone(linePolygons);

    const source = map.getSource('multiSegmentStretchAnimation') as any

    // 创建动画
    const animate = createAnimation({
        reverse: true,
        onUpdate(latest) {
            for (let i = 0; i < linePolygons.features.length; i++) {
                const prop = initData.features[i].properties;
                // 计算线段动态的点坐标生成当前路径
                const polyPath = map.polylineToPolygon(interpolatePointsByRatio(prop.path.geometry.coordinates, latest), prop.offset)
                linePolygons.features[i].geometry.coordinates = polyPath
            }
            source.setData(linePolygons)
        }
    })

    let hoveredStateId: any =  null;
    // 鼠标触摸对应拉伸的线段激活并改变拉伸线段颜色
    map.on("mousemove", "multiSegmentStretchAnimation", function (e:any) {
    
        if (e.features.length > 0) {
            if (hoveredStateId) {
                map.setFeatureState({ source: 'multiSegmentStretchAnimation', id: hoveredStateId }, { hover: false });
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState({ source: 'multiSegmentStretchAnimation', id: hoveredStateId }, { hover: true });
        }
    });
    map.on("mouseleave", "multiSegmentStretchAnimation", function () {
        if (hoveredStateId) {
            map.setFeatureState({ source: 'multiSegmentStretchAnimation', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
    });
    map.on('remove', () => {
        // 删除动画
        animate.remove()
    })
}