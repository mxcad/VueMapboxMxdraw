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
    mapOrigin:[114.0581565,22.543404],

    // CAD图纸中心，对应地图上的位置。
    // 小=左，大=上
    cadOrigin:[114.0581565,22.547404],

    cadFile:"/demo/buf/road.dwg",
    zoom:16,
    // CAD的默认显示区域对的地图上的多少米
    kilometers:4.87,
    mapparam: {
        // Mapbox GL JS 进行地图渲染的 HTML 元素，或该元素的字符串 id 。该指定元素不能有子元素。
        container: "map",

        // 地图最小缩放级别（0-24）。
        minZoom: 0,

        // 地图最大缩放级别（0-24）。
        maxZoom: 24,
        // 地图初始化时的地理中心点。如果构造函数的参数中没有设置 center ，Mapbox GL JS 会在地图样式中进行查找。如果样式中也没定义的话，那么它将默认为 [0, 0] 注意: 为了与 GeoJSON 保持一致，Mapbox GL 采用经度，纬度的顺序 (而不是纬度，经度)。
        center: [114.0581565,22.543404],

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

