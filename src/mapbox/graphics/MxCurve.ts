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

export interface MxCurveOptions extends GraphicsOptions {
    /** 主要构成参数 */
}

export interface MxCurveDefaultOptions extends GraphicsDefaultOptions {
  
}



// 曲线
export class MxCurve extends Graphics {
    static FeatureCollectionExtrusion = turf.featureCollection([])
    static FeatureCollectionFill = turf.featureCollection([])
    static FeatureCollectionLine = turf.featureCollection([])
    constructor(options: MxCurveOptions) {
        if(!options.center) options.center = []
        if(!options.radius) options.radius = 0.1
        if(!options.startAngle) options.startAngle = 0
        if(!options.endAngle) options.endAngle = 360
        super(options);
    }
    getName() {
        return 'MxCurve'
    }

    getCoordinates(options: MxCurveDefaultOptions) {
        if(!this._map) return
        let { type, lineWidth, isExtrusion, coordinates } = options
        // 类型判断 
        const isFill = type === 'fill', isLine = type === 'line'
       
        this.geojson = turf.bezierSpline(turf.lineString(coordinates as turf.helpers.Position[]));
        let _coordinates:turf.helpers.Position[] | turf.helpers.Position[][] = this.geojson.geometry.coordinates
        // 2.判断填充 ？ 生成对应geojson
        if (isFill) _coordinates = [turf.bezierSpline(turf.lineString([..._coordinates,  _coordinates[0]] as turf.helpers.Position[])).geometry.coordinates]
        // 3.判断 线 && 拉伸 
        if (isLine && isExtrusion) (_coordinates = this._map.polylineToPolygon(_coordinates as turf.helpers.Position[], lineWidth as number))

        return _coordinates
    }
}

let curve: MxCurve
// 测试
export function MxCurveTest() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const lines = turf.randomLineString(1, { bbox, num_vertices: 8, max_length: 0.01 })
    curve = new MxCurve({
        coordinates: lines.features[0].geometry.coordinates,
        lineWidth: 2,
        color: "#ff0000"
    })
   
    curve.addTo(map)

    const gui = new GUI()
    gui.addColor(curve.options, 'color')
    gui.add(curve.options, 'opacity', 0, 1, 0.1)
    gui.add(curve.options, 'type', ['fill', 'line'])

    // 面参数
    const fillFolder = gui.addFolder('fillOptions')
    fillFolder.addColor(curve.options, 'outLineColor')

    // 线参数
    const lineFolder = gui.addFolder('lineOptions')
    lineFolder.add(curve.options, 'blur', 0.1, 2, 0.1)
    lineFolder.add(curve.options, 'lineWidth', 1, 20, 0.1)
    lineFolder.add({'dasharray': '1-2'}, 'dasharray', ['1-4','1-3','1-1', '2-1', '3-1']).onChange((v:string)=> {
        curve.options.dasharray = v.split('-').map(n=> Number(n))
    })
    // 拉伸参数
    gui.add(curve.options, 'isExtrusion')
    const extrusionFolder =  gui.addFolder('extrusionOptions')
    extrusionFolder.add(curve.options, 'baseHeight', 0, 100)
    extrusionFolder.add(curve.options, 'height', 0, 500)

    map.on('remove', ()=> {
        gui.domElement.remove()
        MxCurve.removeAllGeoJson()
    })
}