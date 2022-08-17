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


interface MxThreeFlyLineOption {
     // 颜色
     color?:  THREE.Color | string | number,
     // 渐变色
     toColor?: THREE.Color | string | number,
     //提供了路径 则无需传入source和target属性
     curve?: THREE.Curve<THREE.Vector2> | THREE.Curve<THREE.Vector3>,
     // 大小
     size?: number,
     // 源点
     source?: THREE.Vector3,
     // 目的地
     target?: THREE.Vector3,
     // 线段运动速度
     speed?: number,
     // 透明度
     opacity? :number,
     //  高度
     height?:number
}
// 飞线
export class MxThreeFlyLine extends THREE.Points {
    declare userData : {
        animate: AnimateType
        [x:string]:any;
    }
    constructor({
        color = 0xffffff * Math.random(),
        toColor = 0x000fff * Math.random(),
        curve,
        size = 50000,
        height=  100000,
        source = new THREE.Vector3(878259.0000000088, -41173.93528451807),
        target = new THREE.Vector3( 301259.00000000885, 789826.0647154804),
        speed = 4000,
        opacity = 1
    }: MxThreeFlyLineOption) {
        // 获取到路径的中点
        const _center = target.clone().lerp(source, 0.5);
        // 给中点设置高度
        _center.setZ(height)
        // 生成路径
        if(!curve) {
            curve = new THREE.QuadraticBezierCurve3(source, _center ,target)
        }
        const number = source.distanceTo(target) * 2 - size
        // 计算路径中的点
        let points = curve.getPoints(source.distanceTo(_center) / 100) as THREE.Vector3[]
        let geometry = new THREE.Geometry();
        geometry.vertices = points;
        const material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                time: {type: 'f', value: 0.0},
                size:{type:'f',value: size},
                colort: {
                    value: new THREE.Color(color)
                },
                colorf: {
                    value: new THREE.Color(toColor)
                },
                opacity: {
                    value: opacity
                }
            },
            vertexShader: `
            uniform float time;
            uniform float size;
            varying vec3 iPosition;
        
            void main(){
                iPosition = vec3(position);
                float pointsize = 1.;
                if(position.x > time && position.x < (time + size)){
                    pointsize = (position.x - time) / size;
                }
                gl_PointSize = pointsize * 3.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
            `,
            fragmentShader: `
            uniform float time;
            uniform float size;
            uniform vec3 colorf;
            uniform vec3 colort;
            uniform float opacity;
            varying vec3 iPosition;
        
            void main( void ) {
                float end = time + size;
                vec4 color;
                if(iPosition.x > end || iPosition.x < time){
                    discard;
                    //color = vec4(0.213,0.424,0.634,0.3);
                }else if(iPosition.x > time && iPosition.x < end){
                    float step = fract((iPosition.x - time)/size);
        
                    float dr = abs(colort.x - colorf.x);
                    float dg = abs(colort.y - colorf.y);
                    float db = abs(colort.z - colorf.z);
        
                    float r = colort.x > colorf.x?(dr*step+colorf.x):(colorf.x -dr*step);
                    float g = colort.y > colorf.y?(dg*step+colorf.y):(colorf.y -dg*step);
                    float b = colort.z > colorf.z?(db*step+colorf.z):(colorf.z -db*step);
        
                    color = vec4(r,g,b, opacity);
                }
                float d = distance(gl_PointCoord, vec2(0.5, 0.5));
                if(abs(iPosition.x - end) < 0.2 || abs(iPosition.x - time) < 0.2){
                    if(d > 0.5){
                        discard;
                    }
                }
                gl_FragColor = color;
            }
            `
        });
        super(geometry, material);

        this.userData.isStart = false
        const clock = new THREE.Clock()
        this.userData.animate = (() => {
            if (!this.userData.isStart) return
            if (material.uniforms.time.value > number) {
                material.uniforms.time.value = size + speed
            }
            material.uniforms.time.value += speed
        
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
        const source =  randomPonit()
        const target =  randomPonit()
        target.z = Math.floor(Math.random() * (0 - 1000000)) + 1000000;
        const line = new MxThreeFlyLine({
            source,
            target
        })
        line.userData.animate.start()
        addAnimation('MxThreeFlyLine_i_'+ i, line.userData.animate)
        draw.addObject(line)
    }
}