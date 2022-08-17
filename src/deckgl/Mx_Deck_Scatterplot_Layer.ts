///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { random, floatRandom } from "@/mxthree/utils";
import { RGBColor } from "@deck.gl/core/utils/color";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import { GUI } from "dat.gui";
import * as THREE from "three";
import { ScatterplotLayer, ScatterplotLayerProps , MapboxLayer, Position } from "./index";

// 散点图层
export function Mx_Deck_Scatterplot_Layer() {

    interface MapboxScatterplotLayerDataType {
        postion: Position,
        radius: number,
        fillColor: RGBColor,
        lineColor: RGBColor
    }
    
    const data: MapboxScatterplotLayerDataType[] = []
  
    for (let index = 0; index < 100; index++) {
        data.push({
            postion:  [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524)],
            radius: random(10, 60),
            fillColor: [random(0, 255), random(0, 255), random(0, 255)],
            lineColor: [random(0, 255), random(0, 255), random(0, 255)]
        })
    }   
    const props: MapboxLayerProps<MapboxScatterplotLayerDataType> & ScatterplotLayerProps<MapboxScatterplotLayerDataType> = {
        id: 'Mx_Deck_Scatterplot_Layer',
        type: ScatterplotLayer,
        data,
        pickable: true,
        autoHighlight: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        wrapLongitude: false,
        radiusUnits: "meters",
        highlightColor: [255, 0, 0],
        getPosition: d => d.postion,
        getRadius: d => Math.sqrt(d.radius),
        getFillColor: d => d.fillColor,
        getLineColor: d => d.lineColor,
        // 数据 比较 默认是浅比较， 这里只要修改了任何数据就表示数据改变
        dataComparator() {
            return false
        }
    }
    let map = MxMapBox.getMap();
    const myDeckLayer = new MapboxLayer<MapboxScatterplotLayerDataType>(props);
    map.addLayer(myDeckLayer);
    const gui = new GUI()
    const guiParams = {
        fillColor: "#fff",
        lineColor: "#000",
    }

    gui.addColor(guiParams, 'fillColor').onChange((color: string) => {
        const colorArr = new THREE.Color(color).toArray().map((v) => {
            return v * 255
        }) as RGBColor
        data.forEach((info)=> {
            info.fillColor = colorArr
        })
        myDeckLayer.setProps(props)
    })
    gui.addColor(guiParams, 'lineColor').onChange((color: string) => {
        const colorArr = new THREE.Color(color).toArray().map((v) => {
            return v * 255
        }) as RGBColor
        data.forEach((info)=> {
            info.lineColor = colorArr
        })
        myDeckLayer.setProps(props)
    })
    map.once('remove', () => {
        gui.domElement.remove()
    })

}