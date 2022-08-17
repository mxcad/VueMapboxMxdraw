///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import { TripsLayer, MapboxLayer, Position } from "./index";
import { TripsLayerProps } from "@deck.gl/geo-layers/trips-layer/trips-layer"
import { floatRandom, random } from "@/mxthree/utils";
import { RGBColor } from "@deck.gl/core/utils/color";
import { FeatureCollection, Geometry } from "@turf/turf";
import { addAnimation, animateStop } from "@/mapbox/animate";
// 路径流动图层
export function Mx_Deck_Flow_Path_Layer() {
    let map = MxMapBox.getMap();
    let geoDatas: FeatureCollection<Geometry, {color: RGBColor}> = {
        type: "FeatureCollection",
        features: []
    }
    interface DataInfo {
        color: RGBColor
        waypoints: {
            coordinates: Position,
            timestamp: number
        }[]
    }
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
        const points = [
            [floatRandom(116.38635199091175, 116.39538305393376), floatRandom(39.91061214191254, 39.901018636226524)],
            [floatRandom(116.38635199091175, 116.39538305393376), floatRandom(39.91061214191254, 39.901018636226524)],
            [floatRandom(116.38635199091175, 116.39538305393376), floatRandom(39.91061214191254, 39.901018636226524)]
        ] as Position[]
        const color:RGBColor = [random(0, 255), random(0, 255), random(0, 255)];
        data.push({
            color,
            "waypoints": [
                {
                    "coordinates": points[0],
                    "timestamp": now
                },
                {
                    "coordinates": points[1],
                    "timestamp": now + 1000
                },
                {
                    "coordinates": points[2],
                    "timestamp": now + 2000
                }
            ]
        })
        geoDatas.features.push({
            type: "Feature",
            geometry: {
                "type": "LineString",
                'coordinates': points
            },
            properties: {
                color
            }
        });
    };


    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": geoDatas as any
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": ['get', 'color'],
            "line-width": 8,
            'line-opacity': 0.1,
        }
    });
  
   
    const props: MapboxLayerProps<DataInfo> & TripsLayerProps<DataInfo> = {
        id: 'Mx_Deck_Model_Layer',
        type: TripsLayer,
        data,
        getPath: d => d.waypoints.map(p => p.coordinates),
        getTimestamps: d => d.waypoints.map(p => p.timestamp -now),
        getColor: d => d.color,
        opacity: 0.8,
        widthMinPixels: 5,
        capRounded: true,
   
        trailLength: 200,
        currentTime: 0,
        pickable: true,
        autoHighlight: true,
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
    let startNum = 0
    let animateId = NaN
    function animate() {
        if(startNum > 2000) {
            startNum = 0
        }
        startNum += 10
        myDeckLayer.setProps({
            currentTime: startNum
        })
        animateId = requestAnimationFrame(animate);
    }
    animate()
    map.on("remove",()=> {
        cancelAnimationFrame(animateId)
    })
    
   
}