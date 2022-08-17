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

// 计算最短路径
export function computingTheShortestPath() {
    let map = MxMapBox.getMap();
    // 生成随机线段
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 随机多边形障碍物
    const polygons = turf.randomPolygon(30, {bbox, max_radial_length: 0.002})
    polygons.features = polygons.features.map((feature)=> {
        feature.properties = {
            color: [random(0, 255), random(0, 255), random(0, 255)]
        }
        return feature
    })
     // 生成随机点
     const pointCoordinates = turf.randomPoint(2,{
        bbox
    }).features.map(({geometry})=> {
        return geometry.coordinates
    }) as [number, number][]
    // 起始点
    const pt1 = new mapboxgl.Marker({
        color: "blue"
    }).setLngLat(pointCoordinates[0]).addTo(map).setDraggable(true).on('dragend', () => {
        updateClosetPath(pt1.getLngLat().toArray(), pt2.getLngLat().toArray());
    })

    // 终点
    const pt2 = new mapboxgl.Marker({
        color: "red"
    }).setLngLat(pointCoordinates[1]).addTo(map).setDraggable(true).on('dragend', () => {
        updateClosetPath(pt1.getLngLat().toArray(), pt2.getLngLat().toArray());
    })

  

    // 下面根据两点计算最短路径
    const updateClosetPath = (startPoint: turf.Coord, endPoint: turf.Coord) => {
        
        const result = turf.shortestPath(startPoint, endPoint, {
            obstacles: polygons 
        }) as any
        if (result.error) {
            console.log(result.error)
        } else {
            drawPath(result);
           
        }
    }
    // 绘制路径
    const drawPath = (path: any) => {
        map.getLayer('computingTheShortestPath_active') && map.removeLayer('computingTheShortestPath_active')
        map.getSource('computingTheShortestPath_active') && map.removeSource('computingTheShortestPath_active')
        map.addLayer({
            id: "computingTheShortestPath_active",
            source: {
                type: 'geojson',
                data: path
            },
            type: "line",
            layout: {
                'line-cap': 'butt',
                'line-join': 'bevel',

            },
            paint: {
                "line-opacity": 1,
                "line-width": 5,
            }
        })
    }
    map.addLayer({
        id: "computingTheShortestPath_1",
        source: {
            type: 'geojson',
            data: polygons
        },
        type: "fill",
        layout: {
          
            
        },
        paint: {
            'fill-color': ['get', 'color']

        }
    })
}