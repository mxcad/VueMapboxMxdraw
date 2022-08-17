///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { MxMapBox } from "@/mapbox";
import { addAnimation } from "@/mapbox/animate";
import resourceTracker from "@/mxdraw/ResourceTracker";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { AnimateType } from "./types";
import { randomPonit } from "./utils";

interface MxThreeRadialGradientSphereOption {
    radius?: number,
    color?: number | string | THREE.Color
    // 放大倍数
    multiple?: number
    // 扩散速度 0-1
    speed?: number
}

// 径向渐变球
export class MxThreeRadialGradientSphere extends THREE.Mesh {
    declare userData : {
        animate: AnimateType
        [x:string]:any;
    }
    constructor({ radius = 4000, color = 0xffffff * Math.random(), multiple = 20, speed = 0.2}: MxThreeRadialGradientSphereOption) {
        let map = MxMapBox.getMap();
        const geometry = new THREE.SphereGeometry( radius, 30, 30 ,0, Math.PI * 2,0, Math.PI / 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_color: {
                    value: new THREE.Color(color)
                },
                bearing: {
                    value: new THREE.Vector3(0, 0, 1)
                }
            },
            transparent: true,
            depthTest: true,
            depthWrite: false,
            dithering: false,
            side: 4,    
            vertexShader: `
                varying vec3 vNormal;
                void main()
                {
                    vNormal = normalize( normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                uniform vec3 u_color;
                uniform vec3 bearing;
                void main()
                {
                    // vec3 z = vec3(0.0, 0.0, 0.0);
                    float x = abs(dot(vNormal, bearing));
                    float alpha = pow( x - 1.0, 2.0 );
                    gl_FragColor = vec4( u_color, alpha );
                }
            `
        })

        super(geometry, material);
        this.rotation.set(Math.PI / 2, 0, -0)
       
        const clock = new THREE.Clock()
        
        this.userData.isStart = false
        this.userData.scale  = 1
        this.userData.speed = speed
        this.userData.multiple = multiple
        this.userData.bearing = new THREE.Vector3(0, 0, 1) 
        this.userData.animate = (() => {
            if (!this.userData.isStart) return
            if(this.userData.scale > this.userData.multiple) {
                this.userData.scale = 1
            }else {
                this.userData.scale += speed
            }
            
            let x = map.getBearing() / 180
            let y = map.getPitch() / 180

            this.userData.bearing.set(0, Math.abs(x) > 0.5 ? y: -y, 1 - y )
            material.uniforms.bearing.value = this.userData.bearing
            this.scale.setScalar(this.userData.scale)
            return this.userData.animate;
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
    for (let i = 0; i < 50; i++) {   
        const sphere = new MxThreeRadialGradientSphere({
            multiple: 5,
            speed: 0.05
        })
        sphere.position.copy(randomPonit())
        sphere.userData.animate.start()
        addAnimation('MxThreeRadialGradientSphere_i_'+ i, sphere.userData.animate)
        draw.addObject(sphere)
    }
}