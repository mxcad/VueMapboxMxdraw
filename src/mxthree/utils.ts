///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import * as THREE from "three";

// 前面取整数部分的浮点数
export function random(lower: number, upper: number) {
    return Math.floor(Math.random() * (upper - lower)) + lower;
}
//浮点随机数
export function floatRandom(upper: number, lower:number) {
    return (Math.random() * (upper  - lower)) + lower
}
// 随机点
export function randomPonit(start = 0, end = 1200000) {
    return new THREE.Vector3(random(start, end), random(start, end), 0)
}

