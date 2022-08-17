///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { addAnimation } from "@/mapbox/animate";
import resourceTracker from "@/mxdraw/ResourceTracker";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { AnimateType } from "./types";
import { randomPonit } from "./utils";

interface MxDiamondTagOption {
    radius?: number
    height?: number
    color?: THREE.Color | string | number
    position?: THREE.Vector3
}

// 菱形标识
export class MxThreeDiamondTag extends THREE.Group {
    declare userData: {
        animate: AnimateType
        [x: string]: any;
    }
    constructor({ radius = 5, height = 20, color = 0xffffff * Math.random(), position = new THREE.Vector3() }: MxDiamondTagOption) {
        super();

        // 创建两个四边锥形集合体
        const geometry = new THREE.ConeGeometry(radius, height / 2, 4, 1, true);
        const geometry1 = new THREE.ConeGeometry(radius, height, 4, 1, true);
        // 创建材质
        const material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 1, color: new THREE.Color(color) });
        // 得到两个锥形物体
        const mesh = new THREE.Mesh(geometry, material);
        const mesh1 = mesh.clone()
        mesh1.geometry = geometry1
        // 提升高度
        mesh.translateY(height + height * 0.75)
        mesh1.translateY(height)

        // 反转角度
        mesh1.geometry.rotateZ(Math.PI)
        this.add(mesh, mesh1)

        // 整个菱形旋转缩放
        this.rotateX(Math.PI / 2)
        this.scale.setScalar(1000)
        // 设置位置
        this.position.copy(position)

        // 动画记录时间戳
        const clock = new THREE.Clock()
        let time = 0
        let is = true
        this.userData.isStart = false
        this.userData.speed = height * 10
        // 在自定义属性中增加动画函数
        this.userData.animate = (() => {
            if (!this.userData.isStart)
                return this.userData.animate;
            this.rotateY(clock.getDelta() * Math.PI);
            if (Number(clock.elapsedTime.toFixed(0)) !== time) {
                is = !is;
                time = Number(clock.elapsedTime.toFixed(0));
            }
            this.translateY(is ? this.userData.speed : -this.userData.speed);
            return this.userData.animate;
        }) as unknown as AnimateType
        // 并赋予开始和暂停的能力
        this.userData.animate.start = (speed?: number) => {
            clock.start()
            this.userData.isStart = true
            this.userData.speed = speed || height * 10

            return this.userData.animate
        }
        this.userData.animate.stop = () => {
            clock.stop()
            this.userData.isStart = false
            return this.userData.animate
        }
        return this
    }
}

export default function () {
    const draw = MxFun.getCurrentDraw()

    for (let i = 0; i < 100; i++) {
        const tag = new MxThreeDiamondTag({
            position: randomPonit()
        })
        tag.userData.animate.start()
        // 添加动画
        addAnimation('MxThreeDiamondTag_i_'+ i, tag.userData.animate)
        draw.addObject(tag)
    }
   
}