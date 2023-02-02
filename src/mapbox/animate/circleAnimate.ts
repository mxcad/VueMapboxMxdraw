
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
import { createAnimation, interpolate } from "../animate";


// 圆动画
export function circleAnimate() {
    let map = MxMapBox.getMap();
    // 圆心位置
    const center = map.getCenter().toArray()

    // 点数据
    const circle = turf.point(center, {
        color: '#ffff00',
        opacity: 1
    }) as any

    // 添加图层
    map.addLayer({
        'id': 'circleAnimate',
        'type': 'circle',
        'source': {
            type: 'geojson',
            data: circle
        },
        'paint': {
            'circle-radius': 10,
            'circle-color': ['get', 'color'],
            'circle-opacity': ['get', 'opacity']
        }
    })
    // 获取数据源
    const source = map.getSource('circleAnimate') as any
   
    // 提供插值函数
    const mapProgressToValues = interpolate([0, 1], [{
        radius: 10, color: "#ffff00", opacity: 0.8
    }, {
        radius: 50, color: "#ff0000", opacity: 0.2
    }])

    // 创建动画
    const animate = createAnimation({
        duration: 2000,
        onUpdate: (t)=> {
            // 得到当前的插值数据
            const value = mapProgressToValues(t)
            circle.properties.color =  value.color
            circle.properties.opacity = value.opacity
            // 设置圆的半径
            map.setPaintProperty('circleAnimate', 'circle-radius', value.radius) 
            source.setData(circle)
        }
    })    
    map.on('remove', ()=> {
        // 删除动画
        animate.remove()
    })
}