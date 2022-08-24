///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "..";
import MapboxDrawerApi from '@dijiang/front_mapbox_custom_draw'
import * as turf from "@turf/turf"
import { MyMarker } from "../pointTag/setHeight";
// 缓冲区计算
export function bufferCalculation() {
    const map = MxMapBox.getMap()
    // 生成随机点
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(50, {bbox})
    // 生成随机标记点
    let markers: MyMarker[] = []
    points.features.forEach((feature)=> {
        markers.push(new MyMarker().setLngLat(feature.geometry.coordinates).addTo(map))  
    })
    // 添加绘制控件
    const api = new MapboxDrawerApi(map as any)
    map.addControl(api._draw)
    // 触发圆绘制
    api.switchDrawTool('circle', { unit: 'm' })

    api.selectCB(({features})=> {
        // 选择元素(绘制圆后会自动选中)触发回调
        if(features[0]) {
            // 添加这个圆
            map.addLayer({
                id: "bufferCalculation",
                source: {
                    type: "geojson",
                    data: features[0]
                },
                type: "fill",
                paint: {
                    "fill-opacity": 0.5
                }
            })
            // 计算圆心和半径
            const center = turf.centroid(features[0]);
            const radius = turf.rhumbDistance(center, features[0].geometry.coordinates[0][0], {units: 'miles'})
            
            // 遍历计算标记点到圆形的位置,如果小于圆半径说明在缓冲区内, 则删除原来的标记点添加新的红色标记点
            markers.forEach((marker, index)=> {
                const lngLat = marker.getLngLat().toArray()
                if(turf.rhumbDistance(lngLat, center, {units: 'miles'}) <= radius) {
                    marker.remove()
                    markers[index] =new MyMarker({
                        color: "#ff0000"
                    }).setLngLat(lngLat).addTo(map)
                }
            })
        }
        map.removeControl(api._draw)
    })
}