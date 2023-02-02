///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

// 图标路径动画

import { MxMapBox } from "../init";
import * as turf from "@turf/turf"
import { createAnimation, interpolatePointsByRatio } from "../animate";
import { random } from "@/mxthree/utils";

export function iconPathAnimation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 根据地图范围生成随机线段
    let lines = turf.randomLineString(5, { bbox, num_vertices: 4, max_length: 0.01 })

     // 生成路径和起始点位
    let _points: turf.helpers.Feature<turf.helpers.Geometry, turf.helpers.Properties>[] = []
    lines.features.map(line=> {
        line.properties = {
            color: [random(0, 255), random(0, 255), random(0, 255)]
        }
        const point0 = turf.point(line.geometry.coordinates[0])
        const point1 = turf.point(line.geometry.coordinates[1])
        // 计算汽车的转向角度
        const bearing = turf.bearing(point0, point1)
        point0.properties = {
            bearing: bearing + 90,
            path: line
        }
        _points.push(point0)
        return line
    })
    // 起始点数据
    const points = turf.featureCollection(_points) as any
    // 添加线段图层
    map.addLayer({
        id: "iconPathAnimation",
        type: "line",
        source: {
            type: "geojson",
            data: lines
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 8,
            "line-opacity": 0.8,
        }
    })
    map.loadImage('./img/car.png', (err, result:any)=> {
        // 加载并添加汽车图片
        map.addImage('carIcon', result)
        // 添加图层
        map.addLayer({
            id: "iconPathAnimation_symbol_icon",
            type: "symbol",
            source: {
                type: "geojson",
                data: points
            },
            layout: {
                'icon-image': 'carIcon',
                'icon-offset': [0, 0],
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
            }
        })
        // 克隆初始化数据
        const initData = turf.clone(points);

        let lastValue = 0;
        const source = map.getSource('iconPathAnimation_symbol_icon') as any
        // 创建动画
        const animate = createAnimation({
            reverse: true,
            duration: 6000,
            onUpdate(latest) {
                // 是否反转动画了,反转动画需要把车的方向改了
                let isReverse = lastValue > latest;
                lastValue = latest;
                points.features.forEach((point:any, index:number)=> {
                    const prop = initData.features[index].properties;
                    // 计算线段的动态点坐标
                    const path = interpolatePointsByRatio(prop.path.geometry.coordinates, latest)
                    if (path.length > 1) {
                        // 开始点和结束点
                        let start = path[path.length - 2];
                        let end = path[path.length - 1];
                        let angle = 0;
                        if (isReverse) {
                            angle = turf.bearing( turf.point(start), turf.point(end));
                        } else {
                            angle = turf.bearing( turf.point(end), turf.point(start))
                        }
                        // 更改方位
                        const _point =points.features[index]
                        if(_point.properties) _point.properties.bearing = angle + 90
                        // 更新坐标
                        points.features[index].geometry.coordinates = end
                    }
                })
                source.setData(points)
                
            }
        })
        map.on('remove', ()=> {
            // 删除动画
            animate.remove()
        })
    })

    
   
}