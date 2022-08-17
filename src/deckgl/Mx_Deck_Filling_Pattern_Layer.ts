///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { floatRandom } from "@/mxthree/utils";

import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import {  GeoJsonLayer, GeoJsonLayerProps, MapboxLayer, FillStyleExtension,  } from "./index";
import { polygon, Feature, Geometry, GeometryCollection } from "@turf/turf"
// 填充图案图层
export function Mx_Deck_Filling_Pattern_Layer() {
    let map = MxMapBox.getMap();
    type FeatureInfo = Feature<Geometry | GeometryCollection, {
        name: string,
        color: string | number
    }>
    let data:{
        features: FeatureInfo[],
        type?: string
    } = {
        features: [],
        type: "FeatureCollection"
    }

    let len = 0.0002
    for(let i = 0; i < 200; i++) {
        const p1 = [floatRandom(116.38635199091175,116.39538305393376), floatRandom(39.91061214191254, 39.901018636226524)]
        const p2 = [p1[0], p1[1] + len];
        const p3 = [p1[0] + len, p1[1] + len];
        const p4 = [p1[0] + len, p1[1]];
        data.features.push(polygon([i % 4 ===  0 ? [p1, p2, p4, p1] : [p1, p2, p3, p4, p1]], {
            name: "polygon" + (i + 1),
            color: "#ff0000"
        }))   
    }

    const patterns = ['dots', 'hatch-1x', 'hatch-2x', 'hatch-cross'];
    const props: MapboxLayerProps<FeatureInfo> & GeoJsonLayerProps<FeatureInfo> & {
        fillPatternMask: boolean,
        fillPatternAtlas: string,
        fillPatternMapping: string,
        getFillPattern: Function,
        getFillPatternScale: number,
        getFillPatternOffset: [number, number]
    } = {
        id: 'Mx_Deck_Filling_Pattern_Layer',
        type: GeoJsonLayer,
        data:data as unknown as FeatureInfo[] ,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1,
        getLineColor: [60, 60, 60],
        getFillColor: [60, 180, 240],
       // props added by FillStyleExtension
        fillPatternMask: true,
        fillPatternAtlas: './img/pattern/pattern.png',
        fillPatternMapping: './img/pattern//pattern.json',
        getFillPattern: (_f: any, {index}: any) => patterns[index % 4],
        getFillPatternScale: 0.01,
        getFillPatternOffset: [0, 0],
        extensions: [new FillStyleExtension({pattern: true})],
    }
   
    const myDeckLayer = new MapboxLayer<FeatureInfo>(props);
    map.addLayer(myDeckLayer);
  
}