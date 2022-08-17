
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { MxMapBox } from "@/mapbox";
import * as L7 from "./index"

// 飞线线动画
export default async function Mx_L7_Flight_Line_Animation() {
    let map = MxMapBox.getMap();
    // 加载17.js
    await L7.init()
    const scene = L7.l7Scene
    map.setMaxZoom(24)
    map.setMinZoom(1)
    map.setZoom(10)
    let bounds = scene.getBounds();
    let lngLat1 = bounds[0]
    let lngLat2 = [bounds[0][0], bounds[1][1]]
    let lngLat3 = bounds[1]
    let lngLat4 = [bounds[1][0], bounds[0][1]]
    const airPorts = [
        {
            name: '地点一',
            lng: lngLat1[0],
            lat: lngLat1[1]
        },
        {
            name: '地点二',
            lng: lngLat2[0],
            lat: lngLat2[1]
        },
        {
            name: '地点三',
            lng: lngLat3[0],
            lat: lngLat3[1]
        },
        {
            name: '地点四',
            lng: lngLat4[0],
            lat: lngLat4[1]
        }
    ];
    const center = scene.getCenter()
   
    const planeTarget = {
        lng2: center.lng,
        lat2: center.lat
    };
    const airLineData = [
        {
            name: '地点一',
            lng: lngLat1[0],
            lat: lngLat1[1],
            ...planeTarget
        },
        {
            name: '地点二',
            lng: lngLat2[0],
            lat: lngLat2[1],
            ...planeTarget
        },
        {
            name: '地点三',
            lng: lngLat3[0],
            lat: lngLat3[1],
            ...planeTarget
        },
        {
            name: '地点四',
            lng: lngLat4[0],
            lat: lngLat4[1],
            ...planeTarget
        }
    ];
    scene.addImage(
        'plane',
        'https://gw.alipayobjects.com/zos/bmw-prod/96327aa6-7fc5-4b5b-b1d8-65771e05afd8.svg'
    );
    let data = {
        "type": "FeatureCollection",
        "name": "dl2",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": [
            { "type": "Feature", "properties": {}, "geometry": { "type": "MultiLineString", "coordinates": [[[116.39026509242694,39.90113695041114], [ 116.38977663083244, 39.90498672900449],[116.39425030597107,39.90692115539349]]] } },
        ]
    }
    // 显示地点名称
    const airPrtsLayer = new L7.PointLayer()
        .source(airPorts, {
            parser: {
                type: 'json',
                x: 'lng',
                y: 'lat'
            }
        })
        .shape('name', 'text')
        .color('#f00')
        .size(10);
    // 航行线
    const airLineLayer = new L7.LineLayer({ blend: 'normal' })
        .source(airLineData, {
            parser: {
                type: 'json',
                x: 'lng',
                y: 'lat',
                x1: 'lng2',
                y1: 'lat2'
            }
        })
        .shape('arc3d')
        .size(3)
        .color('#f00')
        .style({
            sourceColor: '#00F8F9',
            targetColor: 'rgba(0,248,249,0.1)'
        });

    // 飞机模拟飞行
    const airPlaneLayer = new L7.LineLayer(
        {
            blend: 'normal', 
            zIndex: 2,
        }
    )
        .source(airLineData, {
            parser: {
                type: 'json',
                x: 'lng2',
                y: 'lat2',
                x1: 'lng',
                y1: 'lat'
            }
        })
        .shape('arc3d')
        .texture('plane')
        .size(12)
        .color('#f00')
        .animate({
            duration: 1,
            interval: 0.5,
            trailLength: 0.05
        })
        .style({
            textureBlend: 'replace',
            lineTexture: true, // 开启线的贴图功能
            iconStep: 6, // 设置贴图纹理的间距          
        });

    // 位置光波
    const dotPoint = new L7.PointLayer({ blend: 'additive' })
        .source(airPorts, {
            parser: {
                type: 'json',
                x: 'lng',
                y: 'lat'
            }
        })
        .shape('circle')
        .color('#00F8F9')
        .animate(true)
        .size(80)
        .style({
            opacity: 1.0
        });
    scene.addLayer(dotPoint);
    scene.addLayer(airPrtsLayer);
    scene.addLayer(airLineLayer);
    scene.addLayer(airPlaneLayer);

}