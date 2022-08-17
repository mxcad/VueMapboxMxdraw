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



export interface PhosphorDotMarkerOpions {
    lineColor?:string,
    shadowColor?:string,
    shadowWidth?:string,
    width?:number,
    text?:string,
    textColor?:string
}

export class PhosphorDotMarker extends MyMarker {
    div: HTMLDivElement | undefined;
    private options: (PhosphorDotMarkerOpions & MyMarkerOptions) | undefined;
    constructor(options?:PhosphorDotMarkerOpions & MyMarkerOptions) {
        super(options);
        this.options = options
        this.reander()
    }
    reander() {
        let { lineColor, shadowColor, shadowWidth, width, text, textColor } = this.options || {}
        const el = this.getElement()
        
        el.innerHTML = `
        <div class="phosphor-dot-fluorescence"></div>
        <div class="phosphor-dot-box" style="color: ${textColor || 'rgb(137, 79, 80)'};">
            <span class="phosphor-dot-box-name">${text || ''}</span>
        </div>
        `
        el.style.setProperty('--light-color', lineColor || "#ffff00")
        el.style.setProperty('--box-shadow-color', shadowColor || "#ff0000")
        el.style.setProperty('--box-shadow-width', (shadowWidth || 18) + 'px')
        el.style.setProperty('--container-width', (width || 6) + 'px')
    }

    setOptions(options: PhosphorDotMarkerOpions = {}) {
        this.options = {
            ...this.options,
            ...options
        }
        this.reander()
    }
}
// 荧光点
export function phosphorDot() {
    let map = MxMapBox.getMap();
    const marker = new PhosphorDotMarker().setDraggable(true).setLngLat(map.getCenter()).addTo(map)
    
}