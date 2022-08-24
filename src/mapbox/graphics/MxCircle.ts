///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import * as turf from "@turf/turf"
import { GUI } from "dat.gui";
import { MxMapBox } from "../init";
import { Graphics, GraphicsDefaultOptions, GraphicsOptions} from "./Graphics";

export interface MxCircleOptions extends GraphicsOptions {
    /** 主要构成参数 */
    center?: [number, number] | number[],
    radius?: number,
    startAngle?: number,
    endAngle?: number,
}

export interface MxCircleDefaultOptions extends GraphicsDefaultOptions {
    center: [number, number] | number[],
    radius: number,
    startAngle: number,
    endAngle: number,
}



// 圆
export class MxCircle extends Graphics {
    static FeatureCollectionExtrusion = turf.featureCollection([])
    static FeatureCollectionFill = turf.featureCollection([])
    static FeatureCollectionLine = turf.featureCollection([])
    declare options: MxCircleDefaultOptions
    constructor(options: MxCircleOptions) {
        if(!options.center) options.center = []
        if(!options.radius) options.radius = 0.1
        if(!options.startAngle) options.startAngle = 0
        if(!options.endAngle) options.endAngle = 360
        super(options);
        this._mainParamKeys = [...this._mainParamKeys, 'center', 'radius', 'startAngle', 'endAngle']
    }
    getName() {
        return 'MxCircle'
    }

    getCoordinates(options: MxCircleDefaultOptions) {
        if(!this._map) return
        let { center, radius, startAngle, endAngle, type, lineWidth, isExtrusion } = options
        // 类型判断 
        const isFill = type === 'fill', isLine = type === 'line'
        // 创建圆的geojson数据
        // 1.创建初始圆弧
        this.geojson = turf.lineArc(center, radius, startAngle, endAngle)
        // 1.1 保存初始坐标
        let _coordinates:turf.helpers.Position[] | turf.helpers.Position[][] = this.geojson.geometry.coordinates
        
        // 2.判断填充 ？ 生成对应geojson
        if (isFill) _coordinates = (Math.abs(endAngle - startAngle) === 360 ? [_coordinates] : [[center, ..._coordinates, center]]);
        // 3.判断 线 && 拉伸 
        if (isLine && isExtrusion) (_coordinates = this._map.polylineToPolygon(_coordinates as turf.helpers.Position[], lineWidth as number))

        return _coordinates
    }
}

let circle: MxCircle

export function MxCircleTest() {
    let map = MxMapBox.getMap();
    circle && circle._removeGeoJson()
    const center = map.getCenter().toArray()
    circle = new MxCircle({
        center,
        radius: 0.1,
        startAngle: 90,
        lineWidth: 6,
        isExtrusion: true
    })
   
    circle.addTo(map)
    // 点击事件
    circle.options.onClikc = (c:MxCircle, id:number, e:any)=> {
        c.options.color = "#333"
    }
    const src = "./img/car.png"
    map.loadImage('./img/waimainan.png', (err, img:any)=> {
        map.addImage('ellipse_fill_pattern_img2', img)
    })
    map.loadImage(src, (err, img:any)=> {
        map.addImage('ellipse_fill_pattern_img1', img)
    })

    
    const gui = new GUI()

    // 颜色渐变
    gui.add({  lineGradient: 'red-to-green' }, 'lineGradient', ['red-to-green', 'green-to-red', 'null']).onChange((v)=> {
        if(v === 'null') circle.options.lineGradient = null
        if(v === 'red-to-green') {
            circle.options.lineGradient = [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0, "red",
                1, "green"
                ]
        }
        if(v === 'green-to-red') {
            circle.options.lineGradient = [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0, "green",
                1, "red"
            ]
        }
    })
    // 图片填充
    gui.add(circle.options, 'fillPattern', ['ellipse_fill_pattern_img1', 'ellipse_fill_pattern_img2'])
    gui.add({ removeFillPattern() { circle.options.fillPattern = null } }, 'removeFillPattern')
    // 重要参数
    gui.add(circle.options, 'radius', 0, 1, 0.1)
    gui.add(circle.options, 'startAngle', 0, 360)
    gui.add(circle.options, 'endAngle', 0, 360)
    gui.addColor(circle.options, 'color')
    gui.add(circle.options, 'opacity', 0, 1, 0.1)
    gui.add(circle.options, 'type', ['fill', 'line'])

    // 面参数
    const fillFolder = gui.addFolder('fillOptions')
    fillFolder.addColor(circle.options, 'outLineColor')

    // 线参数
    const lineFolder = gui.addFolder('lineOptions')
    lineFolder.add(circle.options, 'blur', 0.1, 2, 0.1)
    lineFolder.add(circle.options, 'lineWidth', 1, 20, 0.1)
    lineFolder.add({'dasharray': '1-2'}, 'dasharray', ['1-4','1-3','1-1', '2-1', '3-1']).onChange((v:string)=> {
        circle.options.dasharray = v.split('-').map(n=> Number(n))
    })
    // 拉伸参数
    gui.add(circle.options, 'isExtrusion')
    const extrusionFolder =  gui.addFolder('extrusionOptions')
    extrusionFolder.add(circle.options, 'baseHeight', 0, 100)
    extrusionFolder.add(circle.options, 'height', 0, 500)
    

    map.on('remove', ()=> {
        gui.destroy()
        MxCircle.removeAllGeoJson()
    })
}