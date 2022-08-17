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


export interface RotatedTextBoxMarkerOpions {
    shadowColor?:string,
    borderColor?:string,
    width?:number,
    text?:string,
    textColor?:string
    animationName?: string
}
// 文档框标记点
export class RotatedTextBoxMarker extends MyMarker {
    div: HTMLDivElement | undefined;
    private options: (RotatedTextBoxMarkerOpions & MyMarkerOptions) | undefined;
    constructor(options?:RotatedTextBoxMarkerOpions & MyMarkerOptions) {
        super(options);
        this.options = options
        this.reander()
    }
    reander() {
        let { shadowColor, borderColor, text, textColor, animationName } = this.options || {}
        const el = this.getElement()
        el.classList.remove('point-tag-text-boder')
        el.classList.add('point-tag-text-boder')
        el.innerHTML = `
        <div class="point-tag-boder"><span class="point-tag-text">${text || ''}</span></div>
        `
        // 设置css变量
        el.style.setProperty('--border-color', borderColor || '#ffff00')
        el.style.setProperty('--box-shadow-color', shadowColor || '#ff0000')
        el.style.setProperty('--text-color', textColor || '#a7ccc8')
        el.style.setProperty('--animation-name', animationName || 'clipMe1')
    }

    setOptions(options: RotatedTextBoxMarkerOpions = {}) {
        this.options = {
            ...this.options,
            ...options
        }
        this.reander()
    }
}

// 旋转的文本框
export function rotatedTextBox() {
    let map = MxMapBox.getMap();
    const marker = new RotatedTextBoxMarker().setDraggable(true).setLngLat(map.getCenter()).addTo(map)
}