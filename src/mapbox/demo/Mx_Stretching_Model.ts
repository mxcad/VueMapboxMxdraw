///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import resourceTracker from "@/mxdraw/ResourceTracker";
import { GUI, GUIController } from "dat.gui";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { MxMapBox } from "../init";

// 拉伸模型
export default async function () {
    let map = MxMapBox.getMap();
    const data = await fetch('./demo/mapcad.dwg.json')
    const { borderWireFrame } = JSON.parse(await data.text());
    // 获取图纸边框的点
    const borderPoints = borderWireFrame.map((pt: { x: number, y: number, z: number }) => {
        return new THREE.Vector3(pt.x, pt.y, pt.z)
    })
    const centerPoint = new THREE.Box3().setFromPoints(borderPoints).getCenter(new THREE.Vector3())
    const draw = MxFun.getCurrentDraw()

    // 创建一个材质
    const material1 = new THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false });

    const pts2 = [], numPts = 5;
    // 生成五角星的路径
    for (let i = 0; i < numPts * 2; i++) {

        const l = i % 2 == 1 ? 10 : 20;

        const a = i / numPts * Math.PI;

        pts2.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));

    }

    const shape2 = new THREE.Shape(pts2);

    const material2 = new THREE.MeshLambertMaterial({ color: 0xff8000, wireframe: false });

    // 表示两种不同颜色的材质
    const materials = [material1, material2];

    const extrudeSettings3 = {
        depth: 20,
        steps: 1,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 4,
        bevelSegments: 1
    };

    // 创建拉伸几何体
    const geometry3 = new THREE.ExtrudeGeometry(shape2, extrudeSettings3);

    // 创建网格
    const mesh3 = new THREE.Mesh(geometry3, materials);
    
    // 缩放 位置
    mesh3.scale.setScalar(1000)
    mesh3.position.copy(centerPoint.clone().setZ(100000))
    
    // 角度
    mesh3.rotateX(Math.PI / 2);
    draw.addObject(mesh3);
}

