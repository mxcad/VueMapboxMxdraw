///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { Scene, Mapbox } from "@antv/l7"
import { MxMapBox } from "@/mapbox/init"
export * from "@antv/l7"
export let l7Scene: Scene
export function init() {
    return new Promise((res)=> {
        let map = MxMapBox.getMap();
        let scene = l7Scene = new Scene({
            id: 'map',
            logoVisible: false,
            map: new Mapbox({
                mapInstance: map,
            }),
        })
       
        scene.on('loaded', () => {
            window.dispatchEvent(new Event('resize'))
            const logoEl =  document.getElementsByClassName('l7-control-logo')[0]
            logoEl && logoEl.remove()
            res(scene)
        })
        scene.on('remove',()=> {
            scene.removeAllLayer()
            scene.removeAllMakers()
            const _container = document.getElementsByClassName('l7-control-container')[0]
            _container && _container.remove()
            const _scene = document.getElementsByClassName('l7-scene')[0]
            _scene && _scene.remove()
        })
    })
 
}