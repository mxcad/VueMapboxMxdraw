///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { addAnimation } from "@/mapbox/animate"
import resourceTracker from "@/mxdraw/ResourceTracker"
import { MxFun } from "mxdraw"
import * as THREE from "three"
import { AnimateType } from "./types"
import { randomPonit } from "./utils"

const _texture1 = new THREE.TextureLoader().load("./img/leidakedu.png")

interface MxThreeRadarOption {
    // 半径
    radius?: number
    // 雷达颜色
    color?: number | string | THREE.Color
    // 扫描颜色
    scanColor?: number | string | THREE.Color
}
// 雷达扫描
export class MxThreeRadar extends THREE.Mesh {
    declare userData : {
        animate: AnimateType
        [x:string]:any;
    }
    constructor({
        radius = 20480,
        color = 0xffffff * Math.random(),
        scanColor = 0xffffff * Math.random(),
    }: MxThreeRadarOption) {
        // 生成圆形几何体
        const geometry = new THREE.CircleGeometry(radius, 64);
        geometry.computeBoundingSphere()
        // 在材质中加入图片纹理
        const material1 = new THREE.MeshLambertMaterial({
            map: _texture1,
            color: new THREE.Color(color),
            transparent: true,
            side: 2,
    
        })
        // 第二个纹理，用于扫描
        const _texture2 = new THREE.TextureLoader().load("./img/saomiaoleida.png")
        _texture2.center = new THREE.Vector2(0.5,0.5)
        _texture2.repeat = new THREE.Vector2(1, 1)
        const material2 = new THREE.MeshLambertMaterial({
            map: _texture2,
            color: new THREE.Color(scanColor),
            transparent: true
        })
        // 将雷达和扫描效果组合起来
        const mesh1 = new THREE.Mesh(geometry, material2)
        super(geometry, material1);
        this.add(mesh1)
        this.userData.isStart = false
        const clock = new THREE.Clock()
        // 添加动画效果
        
        this.userData.animate = (() => {
            if (!this.userData.isStart) return
            if(_texture2.rotation >= Math.PI *2 ) {
                _texture2.rotation = 0
            }else {
                _texture2.rotation += Math.PI / 180
            }
            return this.userData.animate
        }) as unknown as AnimateType
       
        this.userData.animate.start = () => {
            clock.start()
            this.userData.isStart = true
            return this.userData.animate
        }
        this.userData.animate.stop = () => {
            clock.stop()
            this.userData.isStart = false
            return this.userData.animate
        }
  
    }
}

export default function () {
    const draw = MxFun.getCurrentDraw()
    for (let i = 0; i < 100; i++) {   
        const radar = new MxThreeRadar({})
        radar.position.copy(randomPonit())
        radar.userData.animate.start()
        addAnimation('MxThreeRadar_i_'+ i, radar.userData.animate)
        draw.addObject(radar)
    }
}