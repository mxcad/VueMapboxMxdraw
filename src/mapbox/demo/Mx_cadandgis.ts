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
    call: async () => {
      addRasterTileLayer([["bdsl", "GaoDe.Normal.Map"]]);
    }
  });
}

