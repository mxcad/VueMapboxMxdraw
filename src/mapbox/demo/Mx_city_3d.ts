
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////



import { GUI } from "dat.gui";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { Box3, Group } from "three";

import { MxMapBox } from "../init";
import { City } from "../plugins";

import { MxThreeDiamondTag } from "@/mxthree/MxThreeDiamondTag";
import { addAnimation, removeAnimation } from "../animate";
import { MxThreeFluctuationsAperture } from "@/mxthree/MxThreeDiffusionHalo";
import { MxThreeStereoLightWall } from "@/mxthree/MxThreeStereoLightWall";
import { MxThreeRadialGradientSphere } from "@/mxthree/MxThreeRadialGradientSphere";
import { MxThreeFlyLine } from "@/mxthree/MxThreeFlyLine";
import { MxThreeRadar } from "@/mxthree/MxThreeRadar";


// 获取cad图纸中的部分图层数据
async function getMapCadDwgJSON() {
    const data = await fetch('./demo/mapcad.dwg.json')
    return JSON.parse(await data.text());
}

// 创建菱形柱标记
function createMxThreeDiamondTags(position: THREE.Vector3, index:number | string = Math.random()) {
    const group = new Group()
    const mxThreeDiamondTag = new MxThreeDiamondTag({
        color: 0xff0000 * Math.random(),
    })

    // 波动光圈
    const aperture = new MxThreeFluctuationsAperture({})
    group.add(mxThreeDiamondTag, aperture)
    group.position.copy(position)
    // 启动动画时钟并添加动画
    mxThreeDiamondTag.userData.animate.start()
    aperture.userData.animate.start()

    addAnimation("mx_three_diamond_tag" + index, mxThreeDiamondTag.userData.animate)
    addAnimation("mx_three_diamond_tag_aperture" + index, aperture.userData.animate)
    return group
}
// 城市3d渲染
export async function Mx_city_3d() {
    let map = MxMapBox.getMap();
    const draw = MxFun.getCurrentDraw();
    const { borderWireFrame }  = await getMapCadDwgJSON();
    // 图纸边框构成的点
    const borderPoints: THREE.Vector3[] = [];

    borderWireFrame.pop();

    // 生成菱形柱标记
    let mxThreeDiamondTags = borderWireFrame.map((pt:{x:number; y:number; z:number}, index: number)=> {
        const point = new THREE.Vector3( pt.x, pt.y, pt.z)
        borderPoints.push(point)
        const mxThreeDiamondTag = createMxThreeDiamondTags(point, index)
        draw.addObject(mxThreeDiamondTag)
        return
    });

    // 图纸中心点
    const centerPoint = new Box3().setFromPoints(borderPoints).getCenter(new THREE.Vector3());
    const mxThreeDiamondTag = createMxThreeDiamondTags(centerPoint);
    draw.addObject(mxThreeDiamondTag);
    mxThreeDiamondTags.push(mxThreeDiamondTag, 'center');

    // 添加飞线
    const flyLines: MxThreeFlyLine[] = [];
    borderPoints.forEach((point, index)=> {
        const flyLine = new MxThreeFlyLine({
            target: point,
            source: centerPoint,
            height: 500000,
            toColor: 0xffffff * Math.random(),
            color: 0xffffff * Math.random(),
            speed: 5000
        })
        flyLines.push(flyLine)
        draw.addObject(flyLine)
        flyLine.userData.animate.start()
        addAnimation('fly_line_'+ index, flyLine.userData.animate)
    });

    borderPoints.push(borderPoints[0]);
     // 径向渐变球
     const sphere = new MxThreeRadialGradientSphere({});
     sphere.position.copy(centerPoint);
     sphere.userData.animate.start();
     addAnimation('sphere_animate', sphere.userData.animate);
     draw.addObject(sphere);

    // 添加光墙
    const lightWall = new MxThreeStereoLightWall({
        path: borderPoints
    });
    lightWall.userData.animate.start();
    addAnimation('light_wall', lightWall.userData.animate);
    draw.addObject(lightWall);

    // 添加雷达扫描
    const radar = new MxThreeRadar({})
    radar.userData.animate.start()
    addAnimation('radar_1', radar.userData.animate)
    radar.position.copy(centerPoint)
    draw.addObject(radar)

    // 添加城市模型
    const city = new City()
    const group = city.group
    group.scale.addScalar(200)
    group.rotateX(Math.PI / 2 )
    group.position.copy(centerPoint)
    draw.addObject(group)
    addAnimation('city_animate', city.animate)
    // 添加雷达扫描效果

    const gui = new GUI()
    map.once('remove', () => {
        gui.destroy()
        removeAnimation()
    })
}