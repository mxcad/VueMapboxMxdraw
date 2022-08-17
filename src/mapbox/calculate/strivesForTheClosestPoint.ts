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
import mapboxgl from "mapbox-gl";
import { random } from "@/mxthree/utils";

// 求最近点
export function strivesForTheClosestPoint() {
    let map = MxMapBox.getMap();
    // 生成随机线段
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0],bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const lineStrings = turf.randomLineString(20, {
        bbox,
        max_rotation: Math.PI,
        max_length: 0.005,
        num_vertices: 5
    })
    lineStrings.features = lineStrings.features.map((feature)=> {
        feature.properties = {
            color: [random(0, 255), random(0, 255), random(0, 255)],
            selected: false
        }
        return feature
    })
    
    // 生成随机点
    const pointCoordinates = turf.randomPoint(1,{
        bbox
    }).features.map(({geometry})=> {
        return geometry.coordinates
    }) as [number, number][]

    // 最近点位置
    const pt1 = new mapboxgl.Marker({
        color: "#000"
    }).setLngLat(pointCoordinates[0]).addTo(map)
    // 可拖动的点
    let curIndex = -1;
   const pt2 = new mapboxgl.Marker({
        color: "#ff0000"
    }).setLngLat(pointCoordinates[0]).addTo(map).setDraggable(true).on('dragend',(e:any)=> {
        
        const lnglat = e.target.getLngLat().toArray()
        // 计算所有线段中的最近点
        const { geometry }  = turf.nearestPointOnLine(lineStrings as any, turf.point(lnglat), {units: 'miles'})
        geometry.coordinates
        pt1.setLngLat(geometry.coordinates as [number, number])
        const pt = turf.point(pt1.getLngLat().toArray())
        lineStrings.features.forEach((LineString, index)=> {
            const isPointOnLine = turf.booleanPointOnLine(pt, LineString);
            
            if(isPointOnLine) {
                if(curIndex !== -1 ) {
                    lineStrings.features[curIndex].properties.selected = false
                }
                LineString.properties.selected = true
                curIndex = index
            } 
        })
        const lines = map.getSource('strivesForTheClosestPoint_1') as mapboxgl.GeoJSONSource
        lines.setData(lineStrings)
    })
    // 绘制路径
    const { geometry, properties }  = turf.nearestPointOnLine(lineStrings as any, turf.point(pointCoordinates[0]), {units: 'miles'})
    console.log(properties)
    pt1.setLngLat(geometry.coordinates as [number, number])

    map.addLayer({
        id: "strivesForTheClosestPoint_1",
        source: {
            type: 'geojson',
            data: lineStrings
        },
        type:"line",
        layout: {
            'line-cap': 'butt',
            'line-join': 'bevel'
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-opacity": 1,
            "line-width": ['case', ['to-boolean', ['get', 'selected']], 5, 2],
        }
    })
   
}