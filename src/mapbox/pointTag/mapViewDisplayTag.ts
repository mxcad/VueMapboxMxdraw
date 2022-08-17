///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";
import { ApertureOfBreathMarker } from "./apertureOfBreath";
import * as turf from "@turf/turf"

// 根据地图范围显示隐藏标记点
export function mapViewDisplayTag() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()

    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(30, { bbox })
    const markers = points.features.map((point, index)=> {
       return new ApertureOfBreathMarker().setLngLat(point.geometry.coordinates as [number, number]).addTo(map)
        
    })
   
    function updateMarkers() {
        const bounds = map.getBounds().toArray()
        // 生成当前地图范围
        const searchWithin = turf.polygon([[
            bounds[0],
            [bounds[1][0], bounds[0][1]],
            bounds[1],
            [bounds[0][0], bounds[1][1]],
            bounds[0]
        ]]);
        markers.forEach(marker => {
            const lnglat = marker.getLngLat().toArray()
            // 根据当前标记点位置判断是否在范围内
            const isPointInPolygon =  turf.booleanPointInPolygon(lnglat, searchWithin);
            if(isPointInPolygon) {
                marker.getElement().style.display = 'block'
            }else {
                marker.getElement().style.display = 'none'
            }
        })
    }

    map.on('move', (e)=> {
        updateMarkers()
    })
}