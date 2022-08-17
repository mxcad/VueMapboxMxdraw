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
import {  PathLayer, PathLayerProps, PathStyleExtension, MapboxLayer, Position } from "./index";

// 线动画图层
export function Mx_Deck_LineAnimation_Layer() {
    let map = MxMapBox.getMap();
    interface MapboxLineAnimationLayerDataType {
        path: Position[],
        width: number,
        color: RGBColor
    }
    const data: MapboxLineAnimationLayerDataType[] = []
  
    for (let index = 0; index < 10; index++) {
        data.push({
            path:  [[floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524)], [floatRandom(116.38635199091175,116.39538305393376),floatRandom(39.91061214191254, 39.901018636226524)]],
            width: random(1, 6),
            color: [random(0, 255),random(0, 255),random(0, 255)]
        })
    }   
    class MyPathLayer<D> extends PathLayer<D> {
        getShaders() {
            const shaders = super.getShaders();
            if(shaders.inject['vs:#decl'].indexOf("uniform float dashStart") >= 0) {
                return shaders
            }
            shaders.inject['vs:#decl'] += `\
                            uniform float dashStart;`;
            shaders.inject['vs:#main-end'] += `\
                            vDashOffset += dashStart;`;
            return shaders;
        }
        draw(opts: { uniforms: { dashStart: number; }; }) {
            opts.uniforms.dashStart = (this.props as any).dashStart || 0;
            super.draw(opts);
        }
    }
    interface MyPathLayerProps<D> extends PathLayerProps<D> {
        getDashArray: [number, number];
        dashStart: number;
    }
    let dashStart = (Date.now() / 100) % 1000;
    const props: MapboxLayerProps<MapboxLineAnimationLayerDataType> & MyPathLayerProps<MapboxLineAnimationLayerDataType> = {
        id: 'Mx_Deck_LineAnimation_layer',
        type: MyPathLayer as typeof PathLayer,
        data,
        getPath: d => d.path,
        getWidth: d => d.width,
        getColor: d => d.color,
        getDashArray: [4, 4],
        dashStart,
        widthUnits: 'pixels',
        pickable: true,
        autoHighlight: true,
        extensions: [new PathStyleExtension({highPrecisionDash: true})],
        dataComparator() {
            return false
        }
    }
   
    
    const myDeckLayer = new MapboxLayer<MapboxLineAnimationLayerDataType>(props);
    map.addLayer(myDeckLayer);
  
    let animateId = NaN
    function animate() {
        dashStart = (Date.now() / 100) % 1000;
        myDeckLayer.setProps({dashStart: dashStart});
        animateId = requestAnimationFrame(animate);
    }
    animate()
    map.on("remove",()=> {
        cancelAnimationFrame(animateId)
    })
}