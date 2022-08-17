
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import * as L7 from "./index"

// 光柱和路径动画
export default async function Mx_L7_Beam_Path_Animation() {
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    // 圆形波纹
    const waveLayer = new L7.PointLayer({ zIndex: 2, blend: 'additive' })
        .source(
            [
                { lng: 116.38977663083244, lat: 39.90498672900449, size: 10000 },
            ],
            {
                parser: {
                    type: 'json',
                    x: 'lng',
                    y: 'lat'
                }
            }
        )
        .shape('circle')
        .color('#00F8F9')
        .size('size', v => v / 100.0)
        .animate(true)
        .style({
        });

    // 光柱
    const barLayer = new L7.PointLayer({ zIndex: 2, depth: false })
        .source(
            [
                { lng: 116.38977663083244, lat: 39.90498672900449, size: 10000 },
            ],
            {
                parser: {
                    type: 'json',
                    x: 'lng',
                    y: 'lat'
                }
            }
        )
        .shape('cylinder')
        .color('#00F8F9')
        .size('size', v => [5, 5, v / 100])
        .active({
            color: 'red',
            mix: 0.0,
        })
        .animate(true)
        .style({
            opacityLinear: {
                enable: true, // true - false
                dir: 'up' // up - down
            },
            lightEnable: false
        });

    // 路径
    scene.addImage(
        'arrow',
        'https://gw.alipayobjects.com/zos/bmw-prod/ce83fc30-701f-415b-9750-4b146f4b3dd6.svg'
    );

    let data = {
        "type": "FeatureCollection",
        "name": "dl2",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": [
            { "type": "Feature", "properties": {}, "geometry": { "type": "MultiLineString", "coordinates": [[[116.39026509242694,39.90113695041114], [ 116.38977663083244, 39.90498672900449],[116.39425030597107,39.90692115539349]]] } },
        ]
    }
    const layer = new L7.LineLayer({})
        .source(data)
        .size(5)
        .shape('line')
        .texture('arrow')
        .active(true)
        .color('#00F8F9')
        .animate({
            interval: 1, // 间隔
            duration: 1, // 持续时间，延时
            trailLength: 2 // 流线长度
        })
        .style({
            opacity: 0.6,
            lineTexture: true, // 开启线的贴图功能
            iconStep: 10, // 设置贴图纹理的间距
            borderWidth: 0.4, // 默认文 0，最大有效值为 0.5
            borderColor: '#000' // 默认为 #ccc
        });
   
    scene.addLayer(layer);
    scene.addLayer(waveLayer);
    scene.addLayer(barLayer);
 
}