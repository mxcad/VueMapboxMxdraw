

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
import { Position, ScatterplotLayer, ScatterplotLayerProps } from "./index"
import { ScreenGridLayerProps } from "@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-layer"
// 复合图层[与deck图层叠加]
export function Mx_Deck_CompositeLayer() {
    const map = MxMapBox.getMap()
    // 得到地图范围
    const bounds = map.getBounds().toArray()
    // 当前范围的包围盒
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox

    const polygons = turf.randomPolygon(50, {bbox, num_vertices: 3, max_radial_length: 0.001})
    polygons.features = polygons.features.map((feature)=> {
        feature.properties.color =  [random(0, 255), random(0, 255), random(0, 255)]
        return feature
    })
    map.addLayer({
        id: "Mx_Deck_CompositeLayer_polygons",
        source: {
            type: "geojson",
            data: polygons
        },
        paint: {
            "fill-color": ['get', 'color'],
            "fill-opacity": 0.8
        },
        type: "fill"
    })
    const points = turf.randomPoint(50, { bbox })
    points.features = points.features.map((feature)=> {
        feature.properties.color = [random(0, 255), random(0, 255), random(0, 255)]
        feature.properties.radius = random(10, 30)
        return feature
    })
    const popup = new mapboxgl.Popup({ closeButton: false })
    // const props: MapboxLayerProps<turf.helpers.Feature<turf.helpers.Point, any>> & ScatterplotLayerProps<turf.helpers.Feature<turf.helpers.Point, any>> = {
    //     type: ScatterplotLayer,
    //     id: "Mx_Deck_CompositeLayer_ScatterplotLayer",
    //     data: points,
    //     wrapLongitude: false,
    //     getPosition: (d)=> d.coordinates,
    //     getRadius: (d) => d.properties.radius,
    //     getFillColor: (d) => d.properties.color,
    //     radiusUnits: "meters",
    //     autoHighlight: true,
    //     highlightColor: [255, 0, 255],
    //     pickable: true,
    //     onHover: ({object}:any) => {
    //         if (object) {
    //             popup.setLngLat(object.coordinates);
    //             popup.setHTML(`id: ${object.id}`);
    //             popup.addTo(map);
    //         } else {
    //             popup.remove();
    //         }
    //     },
    // }
    // const myDeckLayer = new MapboxLayer<DataInfo>(props);
    const deckLayer = new ScatterplotLayer({
       
    })
    map.addLayer(deckLayer as any);


}