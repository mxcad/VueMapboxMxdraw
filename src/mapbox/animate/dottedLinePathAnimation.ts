///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { MxMapBox } from "../init";
import * as turf from "@turf/turf"
import { addAnimation, removeAnimation } from "../animate";

// 虚线路径动画
export function dottedLinePathAnimation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const lines = turf.randomLineString(5, {bbox, num_vertices: 4, max_length: 0.01})
    // 创建虚线缓冲数组
   const dashArraySeq = map.createDashArraySeq([5, 10])
    map.addLayer({
        type: "line",
        id: "dottedLinePathAnimation",
        source: {
            type: "geojson",
            data: lines
        },
        paint: {
            "line-dasharray": dashArraySeq[0],
            "line-color": 'red',
            "line-width": 5,
            "line-opacity": 0.8
        }
    })

    let dashArrayIdx = 0;
    setTimeout(()=> {
        addAnimation("dottedLinePathAnimation", ()=> {
            dashArrayIdx = (dashArrayIdx + 1) % dashArraySeq.length;
            map.setPaintProperty('dottedLinePathAnimation', 'line-dasharray', dashArraySeq[dashArrayIdx]);
        })
    }, 100)
    
    map.on('remove', ()=> {
        removeAnimation('dottedLinePathAnimation')
    })
}