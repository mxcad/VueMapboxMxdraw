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
import { random } from "@/mxthree/utils";



export function zoomTag() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()

    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(30, { bbox })
    const markers = points.features.map((point, index)=> {
        const marker = new ApertureOfBreathMarker(
            {
                text: "123"
            }
        ).setLngLat(point.geometry.coordinates as [number, number]).addTo(map)
        return {
            marker,
            minZoom: random(1, 5),
            maxZoom: random(6, 18),
        }
    })
   
   
    function updateMarkers(zoom:number) {
        markers.forEach(({marker, minZoom, maxZoom})=> {
            if(minZoom > zoom || zoom > maxZoom) {        
                marker.getElement().style.display = 'none'
            }else {
                marker.getElement().style.display = 'block'
            }
        })
    }
    map.on('zoom', (e)=> {
        const zoom = map.getZoom()
        updateMarkers(zoom)
    })
}