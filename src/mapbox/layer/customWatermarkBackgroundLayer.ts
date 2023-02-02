///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { MxMapBox } from "../init";

// 自定义水印背景层
export function customWatermarkBackgroundLayer() {
  
    let map = MxMapBox.getMap();
    map.loadImage('https://img1.baidu.com/it/u=630883413,288568907&fm=253&fmt=auto&app=138&f=GIF?w=300&h=300', (err,img)=> {
        if(err) {
            return
        }
        img && map.addImage('watermark', img)     
        const spelLayer = map._findFirstSpeLayer()
        map.addLayer({
            "id": "background",
            "type": "background",
            "paint": {
                "background-pattern": "watermark",
                'background-opacity': 0.3
            },
        },spelLayer ? spelLayer.id : void 0);
    })
   
}