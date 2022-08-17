///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////



import * as THREE from "three"
import { AnimateType } from "./types";
import { addAnimation } from "@/mapbox/animate";
import { MxFun } from "mxdraw";
import { randomPonit } from "./utils";
import resourceTracker from "@/mxdraw/ResourceTracker";


interface MxThreeWaveLightWallOption {
    radius?: number
    height?: number
    opacity?: number
    color?: THREE.Color | string | number
    renderOrder?: number
    speed?: number
}
export class MxThreeWaveLightWall extends THREE.Mesh {
    declare userData : {
        animate: AnimateType
        [x:string]:any;
    }
    constructor({  
        radius = 30000,
        height = 10000,
        opacity = 1,
        speed = 1,
        renderOrder = 1,
        color = 0xffffff * Math.random(),
       }:MxThreeWaveLightWallOption) {

        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
        geometry.translate(0, height / 2, 0);

        const vertexShader = `
        uniform vec3 u_color;

        uniform float time;
        uniform float u_height;
        
        varying float v_opacity;

        void main() {

            vec3 vPosition = position * mod(time, 1.0);

            v_opacity = mix(1.0, 0.0, position.y / u_height);
        
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
        `;
        const fragmentShader = ` 
        uniform vec3 u_color;
        uniform float u_opacity;
        
        varying float v_opacity;

        void main() { 
            gl_FragColor = vec4(u_color, v_opacity * u_opacity);
        }
        `;
        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_height: {
                    value: height
                },
                u_speed: {
                    value: speed
                },
                u_opacity: {
                    value: opacity
                },
                u_color: {
                    value: new THREE.Color(color)
                },
                time: {
                    value: 0
                }
            },
            transparent: true,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        super(geometry, material)
        this.renderOrder = renderOrder
        this.rotateX(Math.PI / 2 ) 

        let time = 0
        this.userData.isStart = false
        const clock = new THREE.Clock()
        this.userData.animate = (() => {
            if (!this.userData.isStart) return
            material.uniforms.time = { value: time += clock.getDelta() };
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


export default async function () {
    const draw = MxFun.getCurrentDraw()
    for (let i = 0; i < 50; i++) {   
        const wall = new MxThreeWaveLightWall({})
        wall.position.copy(randomPonit())
        wall.userData.animate.start()
        addAnimation('MxThreeWaveLightWall_i_'+ i, wall.userData.animate)
        draw.addObject(wall)
    }
}