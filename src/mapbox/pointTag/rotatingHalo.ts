///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init"
import { MyMarker, MyMarkerOptions } from "./setHeight";

export interface RotatingHaloMarkerOpions {
  color?:string,
  width?:number,
  text?:string,
  lineColor?:string
  lightColor?: string
}

export class RotatingHaloMarker extends MyMarker {
  div: HTMLDivElement | undefined;
  private options: (RotatingHaloMarkerOpions & MyMarkerOptions) | undefined;
  constructor(options?:RotatingHaloMarkerOpions & MyMarkerOptions) {
      super(options);
      this.options = options
      this.reander()
  }
  reander() {
      let { lightColor, color, text, lineColor, width } = this.options || {}
      const el = this.getElement()
      el.innerHTML = `
      <div class="rotating-halo__dots-01 rotating-halo__dots" style="--dots-width: 68px;
        --dots-height: 68px;
        --dots-box-shadow-x: 40px;
        --dots-box-shadow-x-negative: -40px;
        --dots-box-shadow-radius1: 32px;
        --dots-box-shadow-radius1-negative: -32px;
        --dots-box-shadow-radius2: 31px;
        --dots-box-shadow-radius2-negative: -31px;"></div><div class="rotating-halo__dots-02 rotating-halo__dots" style="--dots-width: 84px;
        --dots-height: 84px;
        --dots-box-shadow-x: 48px;
        --dots-box-shadow-x-negative: -48px;
        --dots-box-shadow-radius1: 40px;
        --dots-box-shadow-radius1-negative: -40px;
        --dots-box-shadow-radius2: 39px;
        --dots-box-shadow-radius2-negative: -39px;"></div><div class="rotating-halo__dots-03 rotating-halo__dots" style="--dots-width: 100px;
        --dots-height: 100px;
        --dots-box-shadow-x: 56px;
        --dots-box-shadow-x-negative: -56px;
        --dots-box-shadow-radius1: 48px;
        --dots-box-shadow-radius1-negative: -48px;
        --dots-box-shadow-radius2: 47px;
        --dots-box-shadow-radius2-negative: -47px;"></div><div class="rotating-halo-dots-name point-tag-name">
        <span>${text || ''}</span></div>
      `
      el.style.setProperty('width', 'var(--container-width)')
      el.style.setProperty('--light-color', lightColor || '#ffff00')
      el.style.setProperty('--color', color || '#ff0000')
      el.style.setProperty('--line-color', lineColor || '#000')
      el.style.setProperty('--container-width', (width || 100) + 'px')
  }

  setOptions(options: RotatingHaloMarkerOpions = {}) {
      this.options = {
          ...this.options,
          ...options
      }
      this.reander()
  }
}

// 旋转的光环
export function rotatingHalo() {
  let map = MxMapBox.getMap();
    const marker = new RotatingHaloMarker().setDraggable(true).setLngLat(map.getCenter()).addTo(map)
   
}