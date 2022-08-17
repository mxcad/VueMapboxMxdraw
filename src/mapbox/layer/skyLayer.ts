///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";

// 天空图层
export function skyLayer() {
    let map = MxMapBox.getMap();
    map.setPitch(90)
    map.addLayer({
        "id": "skyLayer",
        "type": "sky",
        "paint": {
            "sky-type": "gradient",
            "sky-gradient-center": [0, 0],
            "sky-gradient-radius": 90,
            "sky-gradient": [
                'interpolate',
                ['linear'],
                ['sky-radial-progress'],
                0.8,
                'rgba(135, 206, 235, 1.0)',
                1,
                'rgba(0,0,0,0.1)'
            ],
            "sky-opacity": [
                'interpolate',
                ['exponential', 0.1],
                ['zoom'],
                0,
                0.3,
                22,
                1
            ]
        }
      })
}