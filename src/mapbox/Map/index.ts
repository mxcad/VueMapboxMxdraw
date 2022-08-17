///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { AnyLayer, Map as _Map, AnySourceData, LngLat, Point } from "mapbox-gl"
import { vec4 } from 'gl-matrix';

import * as turf from "@turf/turf"
declare module 'mapbox-gl' {
    export interface CustomLayerInterface {
        metadata?: boolean
    }
}

// 添加地图的数据
interface BaseMapData {
    zoom?: number,
    center?: [number, number],
    pitch?:number,
    sprite?: string,
    sources: {
        [x:string]: AnySourceData
    },
    layers: AnyLayer[]
}
// 添加地图的参数
interface BaseMapOptions {
    styleid: number | string,
    isBaseMap?: boolean
}

// 创建canvas
function createCavans(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}

const _project = _Map.prototype.project
// 扩展重写Map类
export class Map extends _Map {

    // projectEx
    // 用于计算lnglat.alt（高度）
    projectEx(t:mapboxgl.LngLat, e:number) {
        const _map = this as any
        const i= _map.transform.locationCoordinate(LngLat.convert(t)),
        n =  [i.x*_map.transform.worldSize,i.y*_map.transform.worldSize,null!=e?e:i.toAltitude(),1] as any;
        
        return vec4.transformMat4(n, n,_map.transform.pixelMatrix),new Point(n[0]/n[3],n[1]/n[3])
    }
    // 重写 当lnglat.alt存在时参与到位置变换的计算中
    project( lnglat:any): Point  {
        const pr = _project.bind(this)
        return arguments.length >= 1 && "object" == typeof arguments[0] && arguments[0].alt ? 
        this.projectEx(arguments[0], arguments[0].alt) : 
        pr(lnglat)
    }

    /**
     *  添加图层
     * @param layer
     * @param beforeId
    */
    addLayer(layer: AnyLayer, beforeId?: string) {
        // 默认所有通过添加的图层都标识为不是底图
        if (!layer.metadata) {
            layer.metadata = {
                isBaseMap: false,
            };
        }
        super.addLayer(layer, beforeId);
        return this
    }
    /**
     * 切换地图
     * @param {*} data
     * @param {*} options
     */
    changeBaseMap(data: BaseMapData, options: BaseMapOptions) {
        let opt = Object.assign(options, {
            isBaseMap: true,
        });
        this._removeBaseStyle();
        this.addMapStyle(data, opt);
    }
    /**
      * 移除底图
      */
    _removeBaseStyle() {
        let { layers } = this.getStyle();
        for (let layer of layers) {
            if (!layer.metadata || (layer.metadata && layer.metadata.isBaseMap == true)) {
                this.removeLayer(layer.id);
            }
        }
    }
    /**
    * 加载标准mapbox样式文件
    * @param {*} styleUrl
    * @param {*} options
    */
    addMapStyle(styleJson: BaseMapData, options: BaseMapOptions) {
        let { styleid, isBaseMap } = options;
        if (typeof styleJson != 'object') {
            throw new TypeError('addMapStyle需要传入对象类型参数');
        }
        let { zoom, center, pitch } = styleJson;
        Object.keys(styleJson.sources).forEach((key) => {
            if (!this.getSource(key)) {
                this.addSource(key, styleJson.sources[key]);
            }
        });
        if (styleJson.sprite) {
            this._addImages(styleJson.sprite);
        }
        const layerMetaData = {
            isBaseMap: isBaseMap || false,
            aid: `${styleid}`,
        };
        for (const layer of styleJson.layers) {
            let layerid = layer.id;
            layer.metadata = layerMetaData;
            if (!this.getLayer(layerid)) {
                let firstSpeLayer = this._findFirstSpeLayer();
                if (isBaseMap && firstSpeLayer) {
                    this.addLayer(layer, firstSpeLayer.id);
                } else {
                    this.addLayer(layer);
                }
            }
        }
        if (zoom) {
            this.setZoom(zoom);
        }
        if (pitch) {
            this.setPitch(pitch);
        }
        if (center) {
            this.setCenter(center);
        }
    }
    /**
     * 解析雪碧图，穿件canvas绘制图标
     * @param {*} spritePath
     */
    _addImages(spritePath: string) {
        let self = this;
        fetch(`${spritePath}.json`)
            .then((result) => result.json())
            .then((spriteJson) => {
                const img = new Image();
                img.onload = function () {
                    Object.keys(spriteJson).forEach((key) => {
                        const spriteItem = spriteJson[key];
                        const { x, y, width, height } = spriteItem;
                        const canvas = createCavans(width, height);
                        const context = canvas.getContext('2d') as CanvasRenderingContext2D 
                        context.drawImage(img, x, y, width, height, 0, 0, width, height);
                        const base64Url = canvas.toDataURL('image/png');
                        self.loadImage(base64Url, (error, simg: HTMLImageElement | ImageBitmap | undefined) => {
                            if(error) {
                                console.error(error)
                                return
                            }
                            if (self.hasImage(key)) {
                                self.removeImage(key);
                            }
                            simg && self.addImage(key, simg);
                        });
                    });
                };
                img.crossOrigin = 'anonymous';
                img.src = `${spritePath}.png`;
            });
    }
    /**
     * 查询第一个非底图图层
     */
    _findFirstSpeLayer() {
        let { layers } = this.getStyle();
        for (let layer of layers) {
            if (layer.metadata && layer.metadata.isBaseMap == false) {
                return layer;
            }
        }
        return null;
    }
     /**
      * 添加默认图层组
      * 按照点(mx.layer.symbol)、线(mx.layer.line)、面(mx.layer.fill) 分层
    */
      addGroupLayer() {
        this.addLayer({
            id: 'mx.layer.fill',
            type: 'fill',
            source: {
                type: 'geojson',
                data: {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [[]]
                    },
                    properties: {}
                },
            },
        });
        this.addLayer({
            id: 'mx.layer.line',
            type: 'line',
            source: {
                type: 'geojson',
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: []
                    },
                    properties: {}
                },
            },
        });
        this.addLayer({
            id: 'mx.layer.symbol',
            type: 'symbol',
            source: {
                type: 'geojson',
                data: {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: []
                    },
                    properties: {}
                },
            },
        });
    }
    /** 
     * 创建虚线缓冲数组
     * */ 
    createDashArraySeq(dash: number[], speed = 1) {
        let dashArraySeq = [dash];
        for (let i = speed, len = dash[0] + dash[1]; i < len; i += speed) {
            const arr = [];
            if (i <= len - dash[0]) {
                arr.push(0, i, dash[0], dash[1] - i);
            } else {
                const leftFillCnt = i - (len - dash[0]);
                arr.push(leftFillCnt, dash[1], dash[0] - leftFillCnt, 0);
            }
            dashArraySeq.push(arr);
        }
        return dashArraySeq;
    }
    /** 
     * 线段转多边形
     * */ 
    polylineToPolygon(path: number[][], offset: number) {
        if (path.length < 2) {
            return []
        }
        const line = turf.lineString(path)
        const offsetLine1 = turf.lineOffset(line, offset, { units: "meters" })
        const offsetLine2 = turf.lineOffset(line, -offset, { units: "meters" })
        const points = [...offsetLine1.geometry.coordinates, ...offsetLine2.geometry.coordinates.reverse(), offsetLine1.geometry.coordinates[0]]
        return [points]
    }

}