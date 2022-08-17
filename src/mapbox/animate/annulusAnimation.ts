
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
import { random, floatRandom } from "@/mxthree/utils";

// 圆环动画
export function annulusAnimation() {
    let map = MxMapBox.getMap();
    // 得到地图范围
    const bounds = map.getBounds().toArray()
    // 当前范围的包围盒
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 生成包围盒范围内的50的随机位置的点数据
    const points = turf.randomPoint(50, {bbox})
    const width  = 0.009

    // 根据点数据生成圆环数据
    const annulusArr = turf.featureCollection(points.features.map((point)=> {
        // 生成随机的圆环半径以及角度
        const radius =  floatRandom(0.05, 0.1)
        const bearing1 = random(0, 360)
        const bearing2 = random(0, 360)
        // 创建两个圆弧的数据
        const arc1 = turf.lineArc(point,radius, bearing1, bearing2);
        const arc2 = turf.lineArc(point,radius + width, bearing1, bearing2);
        // 最终返回一个拼接好的圆环数据
        return turf.polygon([[...arc1.geometry.coordinates, ...arc2.geometry.coordinates.reverse(), arc1.geometry.coordinates[0]]], {
            color: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
            outColor: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
            radius,
            width,
            center: point,
            startAngle: bearing1,
            endAngle: bearing2
        })
    }))
    // 添加圆环图层
    map.addLayer({
        id: "annulusAnimation",
        type: "fill",
        source: {
            type: "geojson",
            data: annulusArr
        },
        paint: {
            "fill-color": ['get', 'color'],
            "fill-outline-color":  ['get', 'outColor'],
            "fill-opacity": 0.8,
        }
    })

    // 克隆一份圆环的数据为初始化数据
    const initData = turf.clone(annulusArr)
    // 获取圆环的数据源
    const source = map.getSource('annulusAnimation') as any
    // 插值函数，定义三个不同的keyframes用于插值计算中间值
    const mapProgressToValues = (idx: number) => interpolate(
        [0, 0.5, 1],
        [
            { color: initData.features[idx].properties.color, angle: 0 },
            { color: initData.features[idx].properties.outColor, angle: 180 },
            { color: initData.features[idx].properties.color, angle: 360 },
        ]
    )
    // 创建一个动画
    const animation = createAnimation({
        // 持续时间
        duration: 2000,
        // 动画更新
        onUpdate(latest) {
            for(let i = 0 ; i < annulusArr.features.length; i++) {
                const annulus = annulusArr.features[i]
                // 根据latest 最新的时间获取圆环的颜色和角度
                const { color, angle } =  mapProgressToValues(i)(latest)

                // 得到圆环数据的一些重要参数
                annulus.properties.color = color
                const prop = initData.features[i].properties;
                const startAngle = (prop.startAngle + angle);
                const endAngle = (prop.endAngle + angle);

                // 重新创建圆环数据
                const arc1 = turf.lineArc(prop.center, prop.radius, startAngle , endAngle);
                const arc2 = turf.lineArc(prop.center, prop.radius + prop.width, startAngle , endAngle);
                annulus.geometry.coordinates = [[...arc1.geometry.coordinates, ...arc2.geometry.coordinates.reverse(), arc1.geometry.coordinates[0]]]
            }
            // 重新设置数据源
            source.setData(annulusArr)
        }
    })
    map.on('remove', ()=> {
        // 删除这个动画
        animation.remove()
    })

}