

///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import mapboxgl from "mapbox-gl"
import { MxMapBox } from "@/mapbox"
import { random } from "@/mxthree/utils"
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer"
import * as turf from "@turf/turf"
import { Position, ScatterplotLayer, ScatterplotLayerProps, MapboxLayer } from "./index"
import { Graphics } from "@/mapbox/graphics/Graphics"

// 复合图层[与deck图层叠加]
export function Mx_Deck_CompositeLayer() {
    const map = MxMapBox.getMap()
    // 得到地图范围
    const bounds = map.getBounds().toArray()
    // 当前范围的包围盒
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox

    const polygons = turf.randomPolygon(50, {bbox, num_vertices: 3, max_radial_length: 0.001})
    let graphicsArr: Graphics[] = []
    polygons.features.forEach((feature, index)=> {
        feature.id = index + "-mapbox"
        feature.properties.color = `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`
        const graphics = new Graphics({
            coordinates: feature.geometry.coordinates[0],
            color: feature.properties.color,
            outLineColor: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
            hoverColor: "rgb(255, 0, 255)",
            type: Math.random() > 0.5 ? "fill": "line",
            opacity: Math.random(),
            isExtrusion: Math.random() > 0.5,
            height: Math.random() * 100,
            onHover: (_this: Graphics, id:string, e:any)=> {
                popup.setLngLat(e.lngLat);
                popup.setHTML(`id: ${id}`);
                popup.addTo(map);
            },
            onHoverOut:()=> {
                popup.remove();
            }
        })
        graphicsArr.push(graphics)
        return feature
    })
    Graphics.randerAll(graphicsArr, map)
    const popup = new mapboxgl.Popup({ closeButton: false })


    interface DataInfo {
        id: turf.helpers.Id | undefined,
        coordinates: Position,
        radius: number,
        color: [number, number, number]
    }
    
    
    const points = turf.randomPoint(50, { bbox })
    const data:DataInfo[] = []
    points.features.forEach((feature, index)=> {
        feature.id = index + '-deck'
        data.push({
            id: feature.id,
            coordinates: feature.geometry.coordinates as Position,
            color: [random(0, 255), random(0, 255), random(0, 255)],
            radius: random(10, 30)
        })
    })

   
   
    const props: MapboxLayerProps<DataInfo> & ScatterplotLayerProps<DataInfo> = {
        type: ScatterplotLayer,
        id: "Mx_Deck_CompositeLayer_ScatterplotLayer",
        data,
        wrapLongitude: false,
        getPosition: (d)=>{ return d.coordinates} ,
        getRadius: (d) => d.radius,
        getFillColor: (d) => d.color,
        radiusUnits: "meters",
        autoHighlight: true,
        highlightColor: [255, 0, 255],
        pickable: true,
        onHover: ({object}:any) => {
            if (object) {
                popup.setLngLat(object.coordinates);
                popup.setHTML(`id: ${object.id}`);
                popup.addTo(map);
            } else {
                popup.remove();
            }
        },
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
    map.on('remove', ()=> {
        Graphics.removeAllGeoJson()
    })

}