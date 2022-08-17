
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

// 基础图形
import * as turf from "@turf/turf"
import { AnyPaint, FillExtrusionPaint, FillPaint, LinePaint } from "mapbox-gl";
import { Map } from "@/mapbox/Map"
export interface GraphicsOptions {
    [x: string | symbol]: any
    // 该图形是否单独使用一个图层(这样可以让线渐变等一些属性可以分开处理)
    isNewLayer?: boolean
    /** 主要构成参数 */
    coordinates?: turf.helpers.Position[] | turf.helpers.Position[][]
    color?: string | number[]
    opacity?: number
    type?: 'fill' | 'line' 
    /** 填充参数配置 */
    outLineColor?: string | number[]
    fillPattern?: string | null

    /** 线段参数配置 */
    blur?: number
    lineWidth?: number
    /* 虚线缓冲 */
    dasharray?: number[]
     /* 渐变 */ 
    lineGradient?: any[] | null | undefined

    /** 拉伸配置参数 */
    isExtrusion?: boolean
    /* 存放拉伸圆的 图层名称(没有自动创建) */ 
    extrusionLayerName?: string
    baseHeight?: number
    height?: number,

    /** 事件配置 */ 
    onClikc?: Function

    onHover?: Function
    // hover 时改变图形颜色
    hoverColor?: string | number[]
    onHoverOut?: Function
    
    
}

export interface GraphicsDefaultOptions {
    [x: string | symbol]: any
     // 是否一个图形使用一个图层(这样可以让线渐变等一些属性可以分开处理
     isNewLayer: boolean
    /** 基础参数 */
    coordinates: turf.helpers.Position[] | turf.helpers.Position[][]
    color: string | number[],
    opacity: number,
    type: 'fill' | 'line'

    /** 填充参数配置 */
    outLineColor: string | number[],
   
    /** 线段参数配置 */
    blur: number,
    lineWidth: number,
    /* 虚线缓冲 */
    dasharray: number[]
    /* 渐变 */ 
    lineGradient: any[] | null | undefined

    /** 拉伸配置参数 */
    isExtrusion: boolean
    /* 存放拉伸圆的 图层名称(没有自动创建) */ 
    extrusionLayerName: string
    baseHeight: number,
    height: number,
    fillPattern: string | null | undefined
     /** 事件配置 */ 
     onClikc: Function

     onHover: Function
     // hover 时改变图形颜色
     hoverColor: string | number[]
     onHoverOut: Function
}

// 用于生成唯一图形 ID 的计数器
let idCounter = Date.now() % 1e9;
// 基础的图形类
export class Graphics {
    // 不同类型渲染类型进行几何分组
    static FeatureCollectionExtrusion = turf.featureCollection([])
    static FeatureCollectionFill = turf.featureCollection([])
    static FeatureCollectionLine = turf.featureCollection([])

    static hoveredStateId: string | number | null = null
    static removeAllGeoJson() {
        this.FeatureCollectionExtrusion.features = []
        this.FeatureCollectionFill.features = []
        this.FeatureCollectionLine.features = []
    }
    geojson?: turf.helpers.Feature<turf.helpers.LineString, turf.helpers.Properties> | turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>
    options: GraphicsDefaultOptions = {
        isNewLayer: false,
        color: "#ffff00",
        opacity: 0.8,
        type: "line",
        coordinates: [],
        outLineColor: "#ff0000",   

        blur: 1,
        lineWidth: 1,
        // 虚线数组
        dasharray: [],
        lineGradient: null,

        isExtrusion: false,
        /* 存放拉伸圆的 图层名称(没有自动创建) */ 
        extrusionLayerName: 'Graphics_extrusion',
        baseHeight: 0,
        height: 200,
        fillPattern: null,

         /** 事件配置 */ 
        onClikc: ()=> {},

        onHover: ()=> {},
        // hover 时改变图形颜色
        hoverColor: 'red',
        onHoverOut: ()=> {}
    }
    id =  (Math.random() * 1e9 >>> 0) + (idCounter++)
    /** 这些options选项发生改变将重写创建geojson数据 */ 
    _mainParamKeys = ['type', 'isExtrusion', 'coordinates']
    /** 这些options选项发生改变将重新对该 geojson的properties 属性赋值*/ 
    _propertiesKeys = ['color', 'opacity', 'outLineColor', 'lineWidth', 'blur', 'baseHeight', 'height', 'dasharray', 'fillPattern', 'hoverColor']

    /** 这些options选项需要删除图层才能改变的属性 */
    _removeLayerParamKeys = ['fillPattern', 'lineGradient']
    _map: Map | undefined;
  
    constructor(options: GraphicsOptions) {
        this.setProp(options)
    }
    /** 设置配置参数 */
    setProp(options: GraphicsOptions) {
        // 合并默认参数
        this.options = Object.assign(this.options, options)
        return this
    }

     // 根据type类型分组
     _getTypeGroup(): GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined{
        const _constructor = this.constructor as any
        const { type, isExtrusion } = this.options
        const isFill = type === 'fill', isLine = type === 'line'
         if(isExtrusion) {
            return  _constructor.FeatureCollectionExtrusion as GeoJSON.FeatureCollection<GeoJSON.Geometry>
         }
         if(isFill) {
            return _constructor.FeatureCollectionFill as GeoJSON.FeatureCollection<GeoJSON.Geometry>
         }
         if(isLine) {
            return _constructor.FeatureCollectionLine as GeoJSON.FeatureCollection<GeoJSON.Geometry>
         }
     
     }

    getCoordinates(options: GraphicsDefaultOptions) {
        if(!this._map) return
        let { type, lineWidth, isExtrusion, coordinates } = options
        // 类型判断 
        const isFill = type === 'fill', isLine = type === 'line'
        // 创建圆的geojson数据
        // 1.1 保存初始坐标
        let _coordinates:turf.helpers.Position[] | turf.helpers.Position[][] = coordinates
        
        // 2.判断填充 ？ 生成对应geojson
        if (isFill) _coordinates =  [_coordinates] as unknown as  turf.helpers.Position[]
        // 3.判断 线 && 拉伸 
        if (isLine && isExtrusion) (_coordinates = this._map.polylineToPolygon(_coordinates as turf.helpers.Position[], lineWidth as number))

        return _coordinates
    }
   
    _createGeoJson(options: GraphicsDefaultOptions) {
        let { type, isExtrusion} = options
        // 删除添加到分组中的geojson数据
        this._removeGeoJson()
        // 获取坐标点
        const coordinates = this.getCoordinates(options)
        // 类型判断 
        const isFill = type === 'fill', isLine = type === 'line'
        if(isFill || isExtrusion) (this.geojson = turf.polygon(coordinates as unknown as turf.helpers.Position[][]))
        if(isLine && !isExtrusion) (this.geojson = turf.lineString(coordinates as unknown as turf.helpers.Position[]))
        if(!this.geojson) return null
        // 设置ID
        this.geojson.id = this.id
        // 设置 properties
        this._setGeoJsonProperties(this.options)
        // 获取该渲染类型的分组并添加
        const group = this._getTypeGroup()?.features
        group?.push(this.geojson)
        
        return this.geojson
    }
    
    // 删除在想要分组的数据源中该图形的geojson数据
    _removeGeoJson() {
        if(!this.geojson) return
        if(!this._map) return
        const _constructor = this.constructor as any
        const extrusionIndex = _constructor.FeatureCollectionExtrusion.features.indexOf(this.geojson)
        const fillIndex = _constructor.FeatureCollectionFill.features.indexOf(this.geojson)
        const lineIndex = _constructor.FeatureCollectionLine.features.indexOf(this.geojson)

        if(extrusionIndex >= 0) {
            _constructor.FeatureCollectionExtrusion.features.splice(extrusionIndex, 1)
            const id = this._getSourceOrLayerId({
                isExtrusion: true,
                type: "line"
            })
            const source = this._getSource(this._map, id)
            source && source.setData(_constructor.FeatureCollectionExtrusion as any)
        }
        if(fillIndex >= 0) {
            _constructor.FeatureCollectionFill.features.splice(fillIndex, 1)
            const id = this._getSourceOrLayerId({
                type: "fill"
            })
            const source = this._getSource(this._map, id)
            source && source.setData(_constructor.FeatureCollectionFill as any)
        }
        if(lineIndex >= 0) {
            _constructor.FeatureCollectionLine.features.splice(lineIndex, 1)
            const id = this._getSourceOrLayerId({
                type: "line"
            })
            const source = this._getSource(this._map, id)
            source && source.setData(_constructor.FeatureCollectionLine as any)
        }
    }

    // geojson属性修改
    _setGeoJsonProperties(options: GraphicsDefaultOptions) {
        const { color, opacity, outLineColor, blur, lineWidth, dasharray, baseHeight, height,  hoverColor, fillPattern, lineGradient } = options
        if(this.geojson)
        this.geojson.properties = {
            color, opacity, outLineColor, blur, lineWidth, dasharray, baseHeight, height,  hoverColor, fillPattern, lineGradient
        };
    }
    // 对options的一些属性进行代理 监听变化
    _bindProxyOptions(options: GraphicsDefaultOptions) {
        this.options = new Proxy(options, {
            get: (target, key, receiver) => {
                return target[key]
            },
            set: (target, key, value, receiver) => {
                // 值相等不修改
                if(target[key] === value) return true

                target[key] = value;

                if (this._map && this.geojson) {
                    if(this.options.isExtrusion && key === 'opacity') this._map.setPaintProperty(this._getSourceOrLayerId(this.options), 'fill-extrusion-opacity', this.options.opacity)
                    // 1.主要属性被修改
                    if(this._mainParamKeys.includes(key as string)) this._createGeoJson(this.options);
                    // 1.1 如果修改的是图片填充属性 需要单独删除当前的图层
                    if(this._removeLayerParamKeys.includes(key as string)) this._removeLayer();
                    // 1.2 如果拉伸线段 则 lineWidth改变也要重写创建数据
                    if(this.options.isExtrusion && this.options.type === 'line' && key === 'lineWidth')  this._createGeoJson(this.options);
                    // 2.properties 属性修改
                    if(this._propertiesKeys.includes(key as string))  this._setGeoJsonProperties(this.options)

                    // 如果一下属性改变将重新绑定事件
                    if(key === "type" || key === "isExtrusion")  this._bindEvent(this._map)
                    // 渲染
                    this.rander(this._map)
                }

                return true
            }
        })

    }

    // 添加到地图中
    addTo(map: Map) {
        this._map = map
        // 创建圆geojson数据
        this._createGeoJson(this.options)
        // 绑定options代理(数据改变自动更新渲染)
        this._bindProxyOptions(this.options)
        this.rander(map)
        this._bindEvent(map)  
        return this
    }
    // 绑定事件
    _bindEvent(map: Map) {
        if(!map) return
        const id = this._getSourceOrLayerId(this.options)
        map.on("mousemove", id, (e:any)=> {
           if(e.features.length > 0 && this.id ===  e.features[0].id) {
                this.options.onHover(this, id, e)
                map.setFeatureState({ source: id, id: this.id }, { hover: true });
           }
        });
        map.on("mouseleave", id, (e:any)=> {
            this.options.onHoverOut(this, id, e)
            map.setFeatureState({ source: id, id: this.id }, { hover: false });
        });

        map.on("click", id, (e:any)=> {
            this.options.onClikc(this, id, e)
        })

    }
    // 图形名称（关联 图层和数据源ID名称）
    getName() {
        return "Graphics"
    }
    // 获取SourceId
    _getSourceOrLayerId({ type, isExtrusion }: { type: 'line' | 'fill', isExtrusion?: boolean }) {
        const id = this.options.isNewLayer ? this.id : ''
        if(isExtrusion) return `${this.getName()}${id}_extrusion`
        return `${this.getName()}${id}_${type}`
     }
 
    // 获取对应数据源 Source
    _getSource(map: Map, id?:string):mapboxgl.GeoJSONSource {
        if(!id) id = this._getSourceOrLayerId(this.options)
        let source: mapboxgl.GeoJSONSource = map.getSource(id) as  mapboxgl.GeoJSONSource
        const data = this._getTypeGroup()
        if(!source) (map.addSource(id, { type: "geojson", data,  lineMetrics: true}), source = map.getSource(id) as  mapboxgl.GeoJSONSource);
        data && source.setData(data)
        return source
    }
    // 删除当前数据源
    _removeSource() {
        if(this._map) {
            this._map.removeSource(this._getSourceOrLayerId(this.options))
        }
    }
    // 获取对应图层
    _getLayer(map: Map) {
        let { type, isExtrusion } = this.options
        const paint = this._getPaint()
        const id = this._getSourceOrLayerId(this.options)
        let layer = map.getLayer(id)
        const _type = isExtrusion ? 'fill-extrusion' : type
        if(!layer) map.addLayer({
            id,
            type: _type,
            source: id,
            paint: paint as any,
        }); 
        layer = map.getLayer(id)
        return layer
    }
   
    // 删除当前展示的图层
    _removeLayer() {
        if(this._map) {
            this._map.removeLayer(this._getSourceOrLayerId(this.options))
        } 
    }
    // 渲染函数
    rander(map: Map) {
        if (!this.geojson && !this.options) return;
        const source = this._getSource(map)
        const layer = this._getLayer(map)
    }

    // 删除所有资源
    removeAll() {
        const _constructor = this.constructor as any
        this._removeLayer()
        this._removeSource()
        _constructor.removeAllGeoJson()
        
    }
    // 删除当前图形的数据
    remove() {
        this._removeGeoJson()
    }
    // 修改Paint 属性
    setPaintProperty(name:string, value: any) {
        if(!this._map) {
            return
        }
        this._map.setPaintProperty(this._getSourceOrLayerId(this.options), name, value)
    }
    _getPaint():AnyPaint {
        const { type, isExtrusion, fillPattern, lineGradient } = this.options
        let paint:AnyPaint = {};
        if(isExtrusion) {
            paint = {
                "fill-extrusion-base": ['get', 'baseHeight'],
                "fill-extrusion-color": ['case', ['to-boolean', ['feature-state', 'hover']], ['get', 'hoverColor'], ['get', 'color']],
                "fill-extrusion-height": ['get', 'height'],
                "fill-extrusion-opacity": this.options.opacity,
            } as FillExtrusionPaint
            if(fillPattern){
                paint['fill-extrusion-pattern'] =  ['get', 'fillPattern']
            }
            

            return paint
        }
        if(type === 'fill') {
            paint = {
                "fill-color": ['case', ['to-boolean', ['feature-state', 'hover']], 'red', ['get', 'color']],
                "fill-opacity": ['get', 'opacity'],
                "fill-outline-color": ['get', 'outLineColor'],
            } as FillPaint 
            if(fillPattern) {
                paint['fill-pattern'] = ['get', 'fillPattern']
            }
        }
     
        if(type === 'line') {
            paint = {
                'line-blur': ['get', 'blur'],
                "line-color": ['case', ['to-boolean', ['feature-state', 'hover']], 'red', ['get', 'color']],
                "line-dasharray": ['get', 'dasharray'],
                "line-opacity": ['get', 'opacity'],
                'line-width': ['get', 'lineWidth'],
            } as LinePaint
            if(fillPattern) {
                paint["line-pattern"] =  ['get', 'fillPattern']
            }
            if(lineGradient) {
                paint["line-gradient"] = lineGradient as any
            }
        }
        
        return paint
    }
}