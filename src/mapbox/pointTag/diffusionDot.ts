///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import mapboxgl from "mapbox-gl"
import { MxMapBox } from "../init"
import { MyMarker, MyMarkerOptions } from "./setHeight";


export interface DiffusionDotMarkerOpions {
    textColor?: string,
    text?: string,
    backgroundColor?: string,
    shadowColor?:string,
    width?:number
}

export class DiffusionDotMarker extends MyMarker {
    div: HTMLDivElement | undefined;
    private options: (DiffusionDotMarkerOpions & MyMarkerOptions) | undefined;
    constructor(options?: DiffusionDotMarkerOpions & MyMarkerOptions) {
        super(options);
        this.options = options
        this.reander()
    }
    reander() {
        let { textColor, text, backgroundColor, shadowColor, width } = this.options || {}
        const el = this.getElement()
        el.innerHTML = `
        <div class="diffusion-dot"><div class="diffusion-dot-bg"></div><div class="diffusion-dot-circle"></div></div>
        <div class="diffusion-dot-name" style="color: ${textColor || "#000"};"><span>${text || "测试"}</span></div>
        `
        el.style.setProperty('--background-color', backgroundColor ||  "#c25f24")
        el.style.setProperty('--box-shadow-color', shadowColor || '#25f23c')
        el.style.setProperty('--container-width', (width  || 20) + 'px')
    }

    setBackgroundColor(backgroundColor:string) {
        const el = this.getElement()
        if(this.options) this.options.backgroundColor = backgroundColor
        el.style.setProperty('--background-color', backgroundColor)
    }

    setShadowColor(shadowColor:string) {
        const el = this.getElement()
        if(this.options) this.options.shadowColor = shadowColor
        el.style.setProperty('--box-shadow-color', shadowColor)
    }

    setWidth(width:number) {
        const el = this.getElement()
        if(this.options) this.options.width = width
        el.style.setProperty('--container-width', width + 'px')
    }

    setText(text:string) {
        if(this.options) this.options.text = text
        this.reander()
    }
    setTextColor(textColor:string) {
        if(this.options) this.options.textColor = textColor
        this.reander()
    }
}


// 扩散点
export function diffusionDot() {
    let map = MxMapBox.getMap();
    const marker = new DiffusionDotMarker({
        pitchAlignment: "map", // 与地图对齐，缺省是"viewport"对齐
        rotationAlignment: "map",// 与地图对齐，缺省是"viewport"对齐
    }).setDraggable(true).setLngLat(map.getCenter()).addTo(map)
   

}