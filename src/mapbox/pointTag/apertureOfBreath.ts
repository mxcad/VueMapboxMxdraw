///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";
import { MyMarker, MyMarkerOptions } from "./setHeight";

export interface ApertureOfBreathMarkerOpions {
    background?: string,
    text?: string,
    color?: string
}

export class ApertureOfBreathMarker extends MyMarker {
    div: HTMLDivElement | undefined;
    private options: (ApertureOfBreathMarkerOpions & MyMarkerOptions) | undefined;
    constructor(options?: ApertureOfBreathMarkerOpions & MyMarkerOptions) {
        super(options);
        if(!options) options = {}
        let { background, text, color } = options
        const el = this.getElement()
        el.innerText = '';
        if(!background) options.background = "rgb(72, 5, 202)"
        if(!text) options.text = '测试' 
        if(!color) options.color = 'rgb(5, 250, 0)'
        el.classList.add('aperture_breath')
        if(!this.div) this.div = document.createElement("div");
        el.appendChild(this.div)
        this.options = options
        this.reander()
    }
    reander() {
        let { background, text, color } = this.options || {}
        if(!this.div) this.div = document.createElement("div");
        this.div.innerHTML = 
        `<span class="aperture_breath_point" style="background: ${background};">
        </span>
        <span 
        class="aperture_breath__delay-01 aperture_breath_pulse" 
        style="border-color: ${ color };
        box-shadow: rgb(104, 184, 87) 0px 0px 12px, rgb(104, 184, 87) 0px 0px 20px inset;">
        </span>
        <span class="aperture_breath__delay-02 aperture_breath_pulse" style="border-color: ${background}; box-shadow: rgb(104, 184, 87) 0px 0px 12px, rgb(104, 184, 87) 0px 0px 20px inset;">
        </span>
        <span class="aperture_breath__delay-03 aperture_breath_pulse" style="border-color: ${background}; box-shadow: rgb(104, 184, 87) 0px 0px 12px, rgb(104, 184, 87) 0px 0px 20px inset;">
        </span>
        <div class="aperture_breath_name" style="color: rgb(202, 203, 250);">
        <span class="aperture_breath_name_container">${text}</span>
        </div>`
    }

    setBackground(background: string) {
        if(this.options) this.options.background = background
        this.reander()
    }

    setColor(color: string) {
        if(this.options) this.options.color = color
        this.reander()
    }

    setText(text: string) {
        if(this.options) this.options.text = text
        this.reander()
    }
    
}


// 呼吸的光圈
export function apertureOfBreath() {
    let map = MxMapBox.getMap();
    const marker = new ApertureOfBreathMarker({})
    marker.setDraggable(true).setLngLat(map.getCenter()).addTo(map)
}