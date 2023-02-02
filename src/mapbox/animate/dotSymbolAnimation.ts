
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { MxMapBox } from "..";
import * as turf from "@turf/turf"
import { createAnimation, interpolate } from "../animate";

// 点符号动画[画布每帧绘制生成动画]
export function dotSymbolAnimation() {
    const map = MxMapBox.getMap()
    const bounds = map.getBounds().toArray()
    const bbox = [...bounds[0], ...bounds[1]] as turf.helpers.BBox
    const points = turf.randomPoint(50, {bbox})
    points.features.forEach((feature, index)=> {
        feature.id = index
        feature.properties.name = `名称：${index}`
    })
    
    // 生成图片帧
    const imgConfig = {
        width: 40,
        height: 40,
        data: new Uint8Array(40 * 40 * 4),
        duration: 2000,
        onAdd: function(this:any) {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
            canvas.getContext('2d')?.globalAlpha
        },
         // 在将使用图标的每一帧之前调用一次
         render: function(this:any) {
            const duration = 2000;
            const t = (performance.now() % duration) / duration;
            let context = this.context

            const radius = (this.width / 2) * 0.3;
            const outerRadius = (this.width / 2) * 0.7 * t + radius;
            context?.clearRect(0, 0, this.width, this.height)
            context?.beginPath()
            context?.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0, 
                Math.PI * 2
            )
          
            context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')'
              
           
            context?.fill()
        
            context?.beginPath()

            context?.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            )

            context.fillStyle = 'rgba(255, 200, 200,' + 1 + ')';
            context.strokeStyle = 'white'
            context.lineWidth = 2
        
            context?.fill()
            context.stroke()
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data
            // 不断地重绘地图，导致圆点的平滑动画
            map.triggerRepaint();
    
            // 返回 `true` 让地图知道图像已更新
            return true;
        }
    } 
    
    // 添加图片
    map.addImage('dotSymbolAnimation-img', imgConfig, { pixelRatio: 2 });
  
    // 添加图层
    map.addLayer({
        id: "dotSymbolAnimation",
        type: "symbol",
        source: {type: "geojson", data: points},
        paint: {
            "icon-opacity": ['case', ['to-boolean', ['feature-state', 'hover']], 0.6, 1.0]
        },
        layout: {
            'icon-image': 'dotSymbolAnimation-img',
            'icon-rotation-alignment': 'auto',
            'icon-allow-overlap': true,
            "icon-anchor": "center"
        }
    })
}