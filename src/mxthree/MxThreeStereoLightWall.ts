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

import MapboxDraw from "@mapbox/mapbox-gl-draw"
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { MxMapBox } from "@/mapbox";
import { GUI } from "dat.gui";
import { MxFun } from "mxdraw";
import { addAnimation } from "@/mapbox/animate";
import mapboxgl from "mapbox-gl";
// 光圈背景图片
const bgImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAABACAYAAABsv8+/AAAAAXNSR0IArs4c6QAABHhJREFUeF7t2C9oVWEYx/Hz7m44RESGiCAiIiKCiBhMJpPJZDKZTCaTyWQxmUwmk8lkMplMJpPJJAyDGxa33d0/Rx4u91o2k2Hc32dlXJa+n/ueZ895W9/3rfNDgAABAgQIRAm0vu8HUcViCRAgQIAAga4WgDUOBAgQIECAQJZALQDHspLVEiBAgAABAm1zc/M4BgIECBAgQCBLoG4ATmQlqyVAgAABAgTa1tbWyY2NjYXE9vZ25zOP+YFwHjwP5oF5YB7MBJZtHtYNwCl7EAECBAgQIJAlUAvA3/U2q10tAQIECBCIFagF4HRsvXACBAgQIBAqUAvAmdB22QQIECBAIFagFoCzsfXCCRAgQIBAqEDb2dk5F9oumwABAgQIxArUDcD52HrhBAgQIEAgVKDt7u5eWF9fX+Tv7e11PvOYHwjnwfNgHpgH5sFMYNnmYd0AXAxdfmQTIECAAIFYgVoALsXWCydAgAABAqECtQBcDm2XTYAAAQIEYgVqAbgSWy+cAAECBAiECtQCcDW0XTYBAgQIEIgVaMPh8FpsvXACBAgQIBAqUDcA10PbZRMgQIAAgViBtr+/f2NtbW0BMBqNOp95zA+E8+B5MA/MA/NgJrBs87BuAG7Grj/CCRAgQIBAqEDdANyy4dvwbfjLueEv2xuLHjdS/l/9v/9XdQNwO3T5kU2AAAECBGIF2mg0urO6unoowHg87vydz2EHxPnwfJgP5oP5cLDAUZ+PdQNwN3b9EU6AAAECBEIF2ng8vjcYDLrJZNL5zcE58ByYA+aAOZAxB+oG4H7o8iObAAECBAjECtQNwIODNv65yGGboL/PBPgcvCk7H86H58N8MB+P9nysG4CHseuPcAIECBAgECrQJpPJo3n7yspKN51OFxQ+83AePA/mw0zAPDQPl20e1g3A49DlRzYBAgQIEIgVqBuAJzZ8G743HG943nC94S7bG66ef99g1g3A09j1RzgBAgQIEAgVqBuAZ6HtsgkQIECAQKxA3QA8j60XToAAAQIEQgVqAXgR2i6bAAECBAjECtQC8DK2XjgBAgQIEAgVqAXgVWi7bAIECBAgECtQC8Dr2HrhBAgQIEAgVKAWgDeh7bIJECBAgECsQC0Ab2PrhRMgQIAAgVCBWgDehbbLJkCAAAECsQK1ALyPrRdOgAABAgRCBWoB+BDaLpsAAQIECMQK1ALwMbZeOAECBAgQCBWoBeBTaLtsAgQIECAQK1ALwOfYeuEECBAgQCBUoBaAL6HtsgkQIECAQKxALQBfY+uFEyBAgACBUIFaAL6FtssmQIAAAQKxArUAfI+tF06AAAECBEIFagH4EdoumwABAgQIxArUAvAztl44AQIECBAIFagF4Fdou2wCBAgQIBArUAvA79h64QQIECBAIFSgTafTYWut6/u+85uDc+A5MAfMAXMgYw7UDcAkdPmRTYAAAQIEYgVqAehj64UTIECAAIFQAQtA6BcvmwABAgSyBSwA2d+/egIECBAIFbAAhH7xsgkQIEAgW+APFN2+lgA54G0AAAAASUVORK5CYII="

// 流动效果图片
const flowImg = "data:image/png;base64,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"



interface MxThreeStereoLightWallOption {
    height?:number;
    path?: THREE.Vector3[];
    bgUrl?:string;
    flowUrl?:string;
    // 背景墙颜色
    bgColor?:string|number|THREE.Color;
    // 流动颜色
    flowColor?:string|number|THREE.Color
}


// 光墙
export class MxThreeStereoLightWall extends THREE.Group {
    declare userData : {
        animate: AnimateType
        [x:string]:any;
    }
    constructor({ height = 30000, path = [], bgUrl = bgImg, flowUrl= flowImg, bgColor = 0xffffff * Math.random(), flowColor = 0xffffff * Math.random() }:MxThreeStereoLightWallOption) {

        const bgTexture = new THREE.TextureLoader().load(bgUrl);
        const flowTexture = new THREE.TextureLoader().load(flowUrl);
        flowTexture.wrapS = THREE.RepeatWrapping;
        flowTexture.wrapT = THREE.RepeatWrapping;
        flowTexture.flipY = true
        flowTexture.generateMipmaps = true
        flowTexture.repeat.set(1,3)
        // uv两个方向纹理重复数量
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: bgColor,
            map: bgTexture,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            transparent:true,
        })
        const flowMaterial = new THREE.MeshBasicMaterial({
            color: flowColor,
            map: flowTexture,
            depthTest: true,
            depthWrite: false,
            transparent:true,
            side: THREE.DoubleSide,
            opacity: 1
        })
      
        

        let verticesByTwo:THREE.Vector3[][] = []
        // 1.处理路径数据  每两个顶点为为一组
        // 1.1向z方向拉伸顶点
        path.forEach((pt)=> {
            const { x, y, z} = pt
            verticesByTwo.push([
                pt.clone().set(x, z, y),
                pt.clone().set(x, z - height, y)
            ])
        })
        

        // 2.解析需要渲染的四边形 每4个顶点为一组
        const verticesByFour: THREE.Vector3[][][] = []
        verticesByTwo.forEach((item, i) => {
            if (i === verticesByTwo.length - 1) return;
            verticesByFour.push([item, verticesByTwo[i + 1]])
        });

        // 3.将四边形面转换为需要渲染的三顶点面
        const verticesByThree:THREE.Vector3[] = []
        // 3.1 Float32Array数值形式
        const verticesByNumber:number[] = []
        verticesByFour.forEach((item) => {
            const [[point1, point2], [point3, point4]] = item;
            verticesByNumber.push(
                point2.x, point2.y, point2.z,
                point1.x, point1.y, point1.z,
                point4.x, point4.y, point4.z,
                point1.x, point1.y, point1.z,
                point3.x, point3.y, point3.z,
                point4.x, point4.y, point4.z,
            )
            verticesByThree.push(point2, point1, point4, point1, point3, point4)
        });

        
       
        const geometry = new THREE.BufferGeometry();
         // 4. 设置position
        const vertices = new Float32Array(verticesByNumber);
        geometry.setFromPoints(verticesByThree)
     
        // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]
        const pointsGroupBy18 = new Array(verticesByThree.length / 6)
        .fill(0)
        .map((item, i) => {
            return verticesByThree.slice(i * 6, (i + 1) * 6);
        });
        geometry.computeBoundingBox();
        const { min, max } = geometry.boundingBox;
        const rangeX = max.x - min.x;
        
        const uvs:number[] = []
        pointsGroupBy18.forEach((item) => {
            const point0 = item[0];
            const point5 = item[5];
            let distance =point0.distanceTo(point5) / rangeX;
            uvs.push(0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1)
        })
        
        geometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(uvs), 2)
        );
        geometry.rotateX(Math.PI * 1.5)
        const bgMesh = new THREE.Mesh(geometry, bgMaterial);      
        const flowMesh = new THREE.Mesh(geometry, flowMaterial)
        super()
        this.add(bgMesh, flowMesh)

        let time = 0
        let is = true
        this.userData.isStart = false
        this.userData.speed = height * 10
        const clock = new THREE.Clock()
        this.userData.animate = (() => {
            if (!this.userData.isStart) return
            time += clock.getDelta();
            if(time > 1) {
                time = 0
            }
            flowTexture.offset = new THREE.Vector2(-time,0);
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
    let map = MxMapBox.getMap();
    let mxMap = MxMapBox.getMxMap();
    const data = await fetch('./demo/mapcad.dwg.json')
    const { borderWireFrame } = JSON.parse(await data.text());
    const draw = MxFun.getCurrentDraw()

    const mapbxodraw:any = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            line_string: false
        }
    })
    const gui = new GUI()
    const guiParams = {
        addLine() {
            mapbxodraw.changeMode('draw_line_string')
        }
    }
    gui.add(guiParams, 'addLine').name("绘制光墙")
    map.addControl(mapbxodraw);

    const wall =  new MxThreeStereoLightWall({
        path: borderWireFrame.map((pt: { x: number | undefined; y: number | undefined; z: number | undefined; })=> {
            return new THREE.Vector3(pt.x, pt.y, pt.z || 0)
        })
    }) 
    wall.userData.animate.start()
    addAnimation("MxThreeStereoLightWall_i_start", wall.userData.animate)
    draw.addObject(wall)
    map.on("draw.create", (res) => {
        const coordinates = res.features[0].geometry.coordinates;
        coordinates.push(coordinates[0])
        const wall = new MxThreeStereoLightWall({
            path: coordinates.map((v:[number, number])=> {
                return mxMap.mercatorCoordToCad( mapboxgl.MercatorCoordinate.fromLngLat(v))
            })
        })
        wall.userData.animate.start()
        addAnimation("MxThreeStereoLightWall_i_1", wall.userData.animate)
        draw.addObject(wall)
        mapbxodraw.deleteAll()
      });
    map.once('remove', ()=> {
        gui.destroy()
    })
}