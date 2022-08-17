///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init"
import mapboxgl from "mapbox-gl"
import { MyMarker, MyMarkerOptions } from "./setHeight";


export interface GlowingHaloMarkerOpions {
    textColor?: string,
    text?: string,
    color1?:string,
    color1Transparent?: string,
    color2?:string,
    color2Transparent?:string,
    left?:string,
    shadowWidth?:string,
    shadowWidth1?:string
    width?:number
}

export class GlowingHaloMarker extends MyMarker {
    div: HTMLDivElement | undefined;
    private options: (GlowingHaloMarkerOpions & MyMarkerOptions) | undefined;
    constructor(options?:GlowingHaloMarkerOpions & MyMarkerOptions) {
        super(options);
        this.options = options
        this.reander()
    }
    reander() {
        let { textColor, text, color1, color1Transparent,color2,color2Transparent,left,shadowWidth,shadowWidth1, width } = this.options || {}
        const el = this.getElement()
        el.innerHTML = `
        <div class="glowing-halo-1 glowing-halo-item"></div>
        <div class="glowing-halo-2 glowing-halo-item"></div>
        <div class="glowing-halo-3 glowing-halo-item"></div>
        <div class="glowing-halo-4 glowing-halo-item"></div>
        <div class="glowing-halo-5 glowing-halo-item"></div>
        <div class="glowing-halo-6 glowing-halo-item"></div>
        <div class="glowing-halo-7 glowing-halo-item"></div>
        <div class="glowing-halo-8 glowing-halo-item"></div>
        <div class="glowing-halo-name" style="color: ${textColor || 'rgb(43, 241, 151)'}">
            <span>${text || ''}</span>
        </div>
        `

        // 设置css变量
        el.style.setProperty('--color-1', color1 || 'rgba(53,159,114,0.3)')
        el.style.setProperty('--color-1-transparent', color1Transparent || 'rgba(53,159,114,0.1)')
        el.style.setProperty('--color-2', color2 || 'rgba(212,220,234,0.3)')
        el.style.setProperty('--color-2-transparent', color2Transparent || 'rgba(212,220,234,0.1)')
        el.style.setProperty('--halo-width', (width || 60) + 'px')
        el.style.setProperty('--halo-left', (left || -30) + 'px')
        el.style.setProperty('--box-shadow-width-1', (shadowWidth || 6) + 'px')
        el.style.setProperty('--box-shadow-width-2', (shadowWidth1 || 6) + 'px')
    }
    // 设置属性
    setOptions(options: GlowingHaloMarkerOpions = {}) {
        this.options = {
            ...this.options,
            ...options
        }
        this.reander()
    }
}

// 发光的光环
export function glowingHalo() {
    let map = MxMapBox.getMap();
    const marker = new GlowingHaloMarker().setDraggable(true).setLngLat(map.getCenter()).addTo(map)
}