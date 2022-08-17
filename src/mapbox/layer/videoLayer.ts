///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init"

import { GUI } from "dat.gui"

export function videoLayer() {
    let map = MxMapBox.getMap();
    const points:[number, number][] = [      
        [116.3895843099964,39.90740851785671],
        [116.39241754619292,39.90747437616008],
        [116.39243901010241,39.905762039688796],
        [116.38934820698017,39.905679714741325]
    ]

    map.addLayer({
        id: 'video-layer',
        type: 'raster',
        source: {
            type: "video",
            urls: ['./video/cadmxktsp.mp4'],
            coordinates: points
        }
    });

    const video = map.getSource('video-layer') as any
    const gui = new GUI()
    gui.add(video, 'play')
    gui.add(video, 'pause')
    map.on('remove', ()=> {
        gui.domElement.remove()
    })
}