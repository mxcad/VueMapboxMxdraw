///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import bezierStyle from "./bezierStyle"
import scaleRotateStyle from "./scaleRotateStyle"

// 绘制的图形样式
export default [
    ...bezierStyle,
    ...scaleRotateStyle,
    {
        id: "guide",
        type: "line",
        filter: [
            "all",
            ["==", "$type", "LineString"],
            ["==", "user_isSnapGuide", "true"],
        ],
        layout: {
            "line-cap": "round",
            "line-join": "round",
        },
        paint: {
            "line-color": "#c00c00",
            "line-width": 1,
            "line-dasharray": [5, 5],
        },
    }
]

