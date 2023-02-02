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

export interface MxEllipseOptions extends GraphicsOptions {
    /** 主要构成参数 */
    center?: [number, number] | number[],
    xSemiAxis?: number,
    ySemiAxis?: number,
}

export interface MxEllipseDefaultOptions extends GraphicsDefaultOptions {
    center: [number, number] | number[],
    xSemiAxis: number,
    ySemiAxis: number,
}


// 椭圆
export class MxEllipse extends Graphics {
    constructor(options: MxEllipseOptions) {
        if(!options.center) options.center = [0, 0]
        if(!options.xSemiAxis) options.xSemiAxis = 0.1
        if(!options.ySemiAxis) options.ySemiAxis = 0.15
        if(!options.angle) options.angle = 90
        super(options);
        this._mainParamKeys = [...this._mainParamKeys, 'center', 'xSemiAxis', 'ySemiAxis']
    }
    getName() {
        return 'MxEllipse'
    }

    getCoordinates(options: MxEllipseDefaultOptions) {
        let { center, xSemiAxis, ySemiAxis, type, lineWidth, isExtrusion } = options
        // 类型判断 
        const isFill = type === 'fill', isLine = type === 'line'
        // 创建圆的geojson数据
        // 1.创建初始圆弧
        this.geojson = turf.ellipse(center, xSemiAxis, ySemiAxis, {
            steps: 360
        })
        // 1.1 保存初始坐标
        let _coordinates = (this.geojson.geometry as any).coordinates
        
        // 2.判断填充 ？ 生成对应geojson
        if (isLine) _coordinates = (turf.polygonToLine(this.geojson) as any).geometry.coordinates
        // 3.判断 线 && 拉伸 
        if (isLine && isExtrusion) (_coordinates = this.polylineToPolygon(_coordinates as turf.helpers.Position[], lineWidth as number))

        return _coordinates
    }
}

let ellipse: MxEllipse
// 测试
export function MxEllipseTest() {
    let map = MxMapBox.getMap();
    ellipse && ellipse._removeGeoJson()
    const center = map.getCenter().toArray()
    ellipse = new MxEllipse({
        center,
        radius: 0.1,
        startAngle: 90,
        lineWidth: 6,
        type: "fill",
        fillPattern: 'ellipse_fill_pattern_img1'
    })

    const src = "./img/car.png"
    map.loadImage('./img/waimainan.png', (err, img:any)=> {
        map.addImage('ellipse_fill_pattern_img2', img)
    })
    map.loadImage(src, (err, img:any)=> {
        map.addImage('ellipse_fill_pattern_img1', img)
        ellipse.addTo(map)
        const gui = new GUI()
        // 重要参数
        gui.add(ellipse.options, 'fillPattern', ['ellipse_fill_pattern_img1', 'ellipse_fill_pattern_img2'])
        gui.add({ removeFillPattern() { ellipse.options.fillPattern = null } }, 'removeFillPattern')

        gui.add(ellipse.options, 'xSemiAxis', 0.1, 3, 0.1)
        gui.add(ellipse.options, 'ySemiAxis', 0.1, 3, 0.1)
        gui.addColor(ellipse.options, 'color')
        gui.add(ellipse.options, 'opacity', 0, 1, 0.1)
        gui.add(ellipse.options, 'type', ['fill', 'line'])
    
        // 面参数
        const fillFolder = gui.addFolder('fillOptions')
        fillFolder.addColor(ellipse.options, 'outLineColor')
    
        // 线参数
        const lineFolder = gui.addFolder('lineOptions')
        lineFolder.add(ellipse.options, 'blur', 0.1, 2, 0.1)
        lineFolder.add(ellipse.options, 'lineWidth', 1, 20, 0.1)
        lineFolder.add({'dasharray': '1-2'}, 'dasharray', ['1-4','1-3','1-1', '2-1', '3-1']).onChange((v:string)=> {
            ellipse.options.dasharray = v.split('-').map(n=> Number(n))
        })
        // 拉伸参数
        gui.add(ellipse.options, 'isExtrusion')
        const extrusionFolder =  gui.addFolder('extrusionOptions')
        extrusionFolder.add(ellipse.options, 'baseHeight', 0, 100)
        extrusionFolder.add(ellipse.options, 'height', 0, 500)
        
    
        map.on('remove', ()=> {
            gui.destroy()
            MxEllipse.removeAllGeoJson()
        })
    })
   
   
}