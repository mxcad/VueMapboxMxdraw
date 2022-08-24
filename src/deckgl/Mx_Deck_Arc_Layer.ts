
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "@/mapbox";
import { random } from "@/mxthree/utils";
import { MapboxLayerProps } from "@deck.gl/mapbox/mapbox-layer";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { GUI } from "dat.gui";
import * as THREE from "three";
import { RGBColor } from "@deck.gl/core/utils/color";
import { ArcLayer, ArcLayerProps, MapboxLayer, Position } from "./index";

export function Mx_Deck_Arc_Layer() {
    let map = MxMapBox.getMap();
    // MapboxArcLayer Data属性
    interface MapboxArcLayerDataType {
        inColor: RGBColor;
        toColor: RGBColor;
        from: {
            coordinates: Position;
        };
        to: {
            coordinates: Position;
        };
    }

    const data: MapboxArcLayerDataType[] = [{
        inColor: [random(0, 255), random(0, 255), random(0, 255)],
        toColor: [random(0, 255), random(0, 255), random(0, 255)],
        from: {
            coordinates: [116.39499692772358, 39.90911478782223]
        },
        to: {
            coordinates: [116.39795722866614, 39.90554404214055]
        },
    }]

    const props: MapboxLayerProps<MapboxArcLayerDataType> & ArcLayerProps<MapboxArcLayerDataType> = {
        id: 'Mx_Deck_Arc_Layer',
        type: ArcLayer,
        data,
        pickable: true,
        autoHighlight: true,
        getWidth: 12,
        // diff 比较 默认是浅比较， 这里只要修改了任何数据就表示数据改变
        dataComparator() {
            return false
        },

        getSourcePosition: (d) => d.from.coordinates,
        getTargetPosition: (d) => d.to.coordinates,
        getSourceColor: (d) => d.inColor,
        getTargetColor: (d) => d.toColor,
    }

    const myDeckLayer = new MapboxLayer<MapboxArcLayerDataType>(props);
    map.addLayer(myDeckLayer);
    const gui = new GUI()
    const mapbxodraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            line_string: false
        }
    }) as any
    map.addControl(mapbxodraw)
    map.on("draw.create", (res) => {
        const coordinates = res.features[0].geometry.coordinates;
        coordinates.forEach((coordinate: Position, index:number)=> {
            const pt = coordinate
            const pt1 = coordinates[index + 1]
            if(!pt1) {
                return
            }
            data.push({
                inColor: [random(0, 255), random(0, 255), random(0, 255)],
                toColor: [random(0, 255), random(0, 255), random(0, 255)],
                from: {
                    coordinates: pt
                },
                to: {
                    coordinates: pt1
                },
            })
        })
        mapbxodraw.deleteAll()
        myDeckLayer.setProps(props)
    });
    const guiParams = {
        inColor: "#fff",
        toColor: "#000",
        add() {
            mapbxodraw.changeMode('draw_line_string')
        }
    }
    gui.add(props, 'getWidth', 0, 20).onChange(() => {
        myDeckLayer.setProps(props)
    })

    gui.addColor(guiParams, 'inColor').onChange((color: string) => {
        const colorArr = new THREE.Color(color).toArray().map((v) => {
            return v * 255
        }) as RGBColor
        data[0].inColor = colorArr
        props.data = data
        myDeckLayer.setProps(props)
    })
    gui.addColor(guiParams, 'toColor').onChange((color: string) => {
        const colorArr = new THREE.Color(color).toArray().map((v) => {
            return v * 255
        }) as RGBColor
        data[0].toColor = colorArr
        props.data = data
        myDeckLayer.setProps(props)
    })
    gui.add(guiParams, 'add')
    map.once('remove', () => {
        gui.destroy()
    })

}