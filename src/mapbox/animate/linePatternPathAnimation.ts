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
import { addAnimation, createAnimation, interpolate, removeAnimation } from "../animate";

// 线图案路径动画
export function linePatternPathAnimation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 根据地图范围随机生成线段
    const lines = turf.randomLineString(5, {bbox, num_vertices: 4, max_length: 0.01})
    map.loadImage('./img/arrow.png', (err, result)=> {
        if(err) {
            return
        }
        // 添加箭头图标
        map.addImage('arrowIcon', result as any);
        // 添加线段的数据源
        map.addSource('linePatternPathAnimation_lines_source', {
            'type': 'geojson',
            'data': lines
        })
        
        map.addLayer({
            id: "linePatternPathAnimation_symbol_line",
            type: "symbol",
            source: 'linePatternPathAnimation_lines_source',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 64, // 图标间隔，默认为250
                'icon-image': 'arrowIcon', //箭头图标
                'icon-offset': [0, 0],
                'icon-padding': 0,
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-size': 1
            }
        })
        map.addLayer({
            id: "linePatternPathAnimation_line",
            type: "line",
            source: "linePatternPathAnimation_lines_source",
            paint: {
                "line-color": "green",
                "line-width": 10,
                "line-opacity": 0.5
            }
        }, 'linePatternPathAnimation_symbol_line')
        // 创建动画
        const animate = createAnimation({
            from: 0,
            to: 64,
            repeat: Infinity,
            duration: 1000,
            onUpdate: latest => {
                map.setLayoutProperty('linePatternPathAnimation_symbol_line', 'icon-offset', [latest, 0]);
            }
        })
        map.on('remove', ()=> {
            animate.remove()
        })
    })

}