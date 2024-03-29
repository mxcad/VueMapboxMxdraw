///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";
import { addRasterTileLayer } from "../plugins/InternetMap/loadThirdPartyMaps";
import { getNoStyle } from "../style";

// cad图纸对应地图具体位置
export async function Mx_CADGISDemo() {
  
  MxMapBox.init({
    // 小=左，大=上
    //  图纸中的中心在地址上的位置，单位经纬度
    mapOrigin:[114.06825863001939,22.54283198132819],

     // 小=右，大=下
    //  CAD图纸中的中心中，CAD图纸单位
    cadOrigin:[116275.977014,19273.279085],

    // 一个CAD绘图单位，是现实中多少米.
    meterInCADUnits: 1.0,

    cadFile:"/demo/buf/road.dwg",
    
    zoom:16,
    mapparam: {
        // Mapbox GL JS 进行地图渲染的 HTML 元素，或该元素的字符串 id 。该指定元素不能有子元素。
        container: "map",

        // 地图最小缩放级别（0-24）。
        minZoom: 0,

        // 地图最大缩放级别（0-24）。
        maxZoom: 24,
        // 地图初始化时的地理中心点。如果构造函数的参数中没有设置 center ，Mapbox GL JS 会在地图样式中进行查找。如果样式中也没定义的话，那么它将默认为 [0, 0] 注意: 为了与 GeoJSON 保持一致，Mapbox GL 采用经度，纬度的顺序 (而不是纬度，经度)。
        center: [114.06825863001939,22.54283198132819],

        // 地图初始化时的层级。如果构造函数的参数中没有设置 zoom Mapbox GL JS 会在地图样式中进行查找。如果样式中也没定义的话，那么它将默认为 0
        zoom: 16,
        // 地图的 Mapbox 配置样式
        style: getNoStyle(),

    },
    call: async () => {
      addRasterTileLayer([["bdsl", "GaoDe.Normal.Map"]]);
    }
  });
}

