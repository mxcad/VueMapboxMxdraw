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
import {  SimpleMeshLayer, MapboxLayer, Position3D } from "./index";
import { SimpleMesh, SimpleMeshLayerProps } from "@deck.gl/mesh-layers/simple-mesh-layer/simple-mesh-layer"
import { floatRandom, random } from "@/mxthree/utils";
import { RGBColor } from "@deck.gl/core/utils/color";
import {OBJLoader} from '@loaders.gl/obj';
import { GUI, GUIController } from "dat.gui";
// 模型图层
export function Mx_Deck_Model_Layer() {
    let map = MxMapBox.getMap();
    const data:DataInfo[] = [];
    for(let i = 0; i < 100; i++) {
        data.push({
            position: [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524), 0],
            color: [random(0, 255), random(0, 255), random(0, 255)],
            angle: random(0, 360)
        })
    }
    

    interface DataInfo {
        position: Position3D 
        color: RGBColor
        angle:number
    }

   
    let zoom = map.getZoom();
    const props: MapboxLayerProps<DataInfo> & SimpleMeshLayerProps<DataInfo> = {
        id: 'Mx_Deck_Model_Layer',
        type: SimpleMeshLayer as any,
        data, 
        getPosition: d => d.position,
        mesh:  "./model/humanoid_quad.obj" as unknown as SimpleMesh ,
        getColor: d => d.color,
        getOrientation: d => [0, d.angle, 0],
        sizeScale: 1,
        autoHighlight: true,
        pickable: true,
        loaders: [OBJLoader]
    }
    const myDeckLayer = new MapboxLayer<DataInfo>(props);
    map.addLayer(myDeckLayer);
    const gui = new GUI()
    const guiParmas = {
        isModelZoom: false,
        size: 1
    }
    map.on("zoomend", () => {
        if(guiParmas.isModelZoom) {
            zoom = map.getZoom();
            myDeckLayer.setProps({
                sizeScale: guiParmas.size / Math.pow(2, zoom)
            });
        }
    });
    let sizeController: GUIController 
    gui.add(guiParmas, "isModelZoom").name("模型不缩放").onChange((isModelZoom)=> {
        if(isModelZoom) {
            guiParmas.size  = 40000
        }else {
            guiParmas.size  = 1
        }
        myDeckLayer.setProps({
            sizeScale: isModelZoom ? guiParmas.size / Math.pow(2, zoom) : guiParmas.size
        });
        sizeController.remove()

        if(isModelZoom) {
            sizeController = gui.add(guiParmas, 'size', 1, 100000).name("模型大小").onChange((size)=> {
                myDeckLayer.setProps({
                    sizeScale: size / Math.pow(2, zoom)
                })
            })
        }else {
            sizeController = gui.add(guiParmas, 'size', 1, 10).name("模型大小").onChange((size)=> {
                myDeckLayer.setProps({
                    sizeScale: size
                })
            })
        }
       
    })
    sizeController = gui.add(guiParmas, 'size', 1, 10).name("模型大小").onChange((size)=> {
        myDeckLayer.setProps({
            sizeScale: size
        })
    })
    
    map.once('remove', ()=> {
        gui.destroy()
    })
}