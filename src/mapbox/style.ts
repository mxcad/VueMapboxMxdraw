///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import mapboxgl from "mapbox-gl";

const testStyle = {
    version: 8,
    sprite: "http://localhost:8082/map/sprite/sprite",
    glyphs: "http://localhost:8082/map/fonts/{fontstack}/{range}.pbf",
    sources: {
      "test-vector": {
        type: "vector",
        scheme: "tms",
        // URL 是 GeoServer 中 TMS 的服务链接
        // "tiles": ["URL/{z}/{x}/{y}.pbf"],
        tiles: [
          "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/test%3Ageo@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf",
        ],
        glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      },
    },
    layers: [
      {
        id: "railways",
        source: "test-vector",
        "source-layer": "geo",
        type: "line",
      },
    ],
} as mapboxgl.Style;

 // 高德地图样式测试
 const gaodeStyle = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [
        // wprd0{1-4}
        // scl=1&style=7 为矢量图（含路网和注记）
        // scl=2&style=7 为矢量图（含路网但不含注记）
        // scl=1&style=6 为影像底图（不含路网，不含注记）
        // scl=2&style=6 为影像底图（不含路网、不含注记）
        // scl=1&style=8 为影像路图（含路网，含注记）
        // scl=2&style=8 为影像路网（含路网，不含注记）
        "http://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8"
      ],
     
      tileSize: 256,
    },
    
  },
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 18,
    },
  ],
} as mapboxgl.Style;


const noStyle = {
  version: 8,
  sources: {
  },
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    
  ],
} as mapboxgl.Style;


// 获取本地离线部署样式
export function getTestStyle() {
    return testStyle
}

export function getGaodeStyle() {
  return gaodeStyle
}


export function getNoStyle() {
  return noStyle
}

export const mapboxStyle = {
  streets: 'mapbox://styles/mapbox/streets-v10',
  outdoors: 'mapbox://styles/mapbox/outdoors-v10',
  light: 'mapbox://styles/mapbox/light-v9',
  dark: 'mapbox://styles/mapbox/dark-v9',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v10',
  navigationPreviewDay: 'mapbox://styles/mapbox/navigation-preview-day-v2',
  navigationPreviewNight: 'mapbox://styles/mapbox/navigation-preview-night-v2',
  navigationGuidanceDay: 'mapbox://styles/mapbox/navigation-guidance-day-v2',
  navigationGuidanceNight: 'mapbox://styles/mapbox/navigation-guidance-night-v2'
}

/** 离线加载本地离线部署样式图层（文字和图标） */ 
export function loaclSpriteOrFonts(map: mapboxgl.Map) {
  map.addLayer({
       "id": "points",
       "type": "symbol",
       "source": {
           "type": "geojson",
           "data": {
               "type": "FeatureCollection",
               "features": [{
                   "type": "Feature",
                   "geometry": {
                       "type": "Point",
                       "coordinates": [116.391305, 39.90553]
                   },
                   "properties": {
                       "title": "Mapbo",
                       "icon": "text"
                   }
               }, 
               {
                   "type": "Feature",
                   "geometry": {
                       "type": "Point",
                       "coordinates": [120.391305, 44.90553]
                   },
                   "properties": {
                       "title": "Mapbox SF",
                       "icon": "deit"
                   }
               }]
           }
       },
       "layout": {
           "icon-image": "{icon}",
           "text-field": "{title}",
           "text-font": ["Open Sans Regular"],
           "text-offset": [0, 0.6],
           "text-anchor": "top"
       }
   });
}