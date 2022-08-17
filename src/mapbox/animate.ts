///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { interpolateArray, interpolateObject, piecewise } from "d3-interpolate"
import { Clock } from "three"
import * as ease from "d3-ease"
import { getScaleFunctionByScaleType } from "@deck.gl/aggregation-layers/utils/scale-utils"


// 动画队列
let animate = new Map()
let animateIds: Set<number> = new Set()

/** 添加动画 */
export function addAnimation(key: string, animateFun: Function) {
    animate.set(key, animateFun)
}

/** 删除动画 */
export function removeAnimation(key?: string) {
    if (key) {
        animate.delete(key)
    } else {
        animate.clear()
    }
}


// 二分法计算最近的数组下标
function binarySearch(arr: number[], num: number) {
    let left = 0;
    let right = arr.length;
    while (left <= right) {
        var center = Math.floor((left + right) / 2);
        if (num < arr[center]) {
            right = center - 1;
        } else {
            left = center + 1;
        }
    }
    return right;
}
// 插值函数
interface interpolateOptions { ease?: (t: number) => number; }
export function interpolate<T extends Object>(inputs: number[], outputs: T[], options?: interpolateOptions): (t: number) => T {
    if (!options) options = {} as interpolateOptions
    if (!options.ease) {
        options.ease = ease.easeLinear
    }
    const arr: any[] = []
    outputs.forEach((output: T, index) => {
        let outputEnd = outputs[index + 1]
        if (!outputEnd) {
            return
        }
        arr[index] = interpolateObject(output, outputEnd)
    })
    return function (t: number) {
        if (options && options.ease) {
            const _t = options.ease(t)
            // 找到当前_t在在哪一个区间中
            let index = binarySearch(inputs, _t)
            // 已经经过的区间范围
            let intervalRangeOffset = index === 0 ? 0 : inputs[index]
            // 区间比例倍数(当前区间在扩展到整个插值区域需要扩展的倍数)
            const intervalMultipleProportion = 1 / (inputs[index + 1] -  inputs[index]);
            // 找到对应区间的插值器，将_t值按照该区间在整个插值去的比例去缩放
            return arr[index]((_t - intervalRangeOffset) * intervalMultipleProportion)
        }
    }
}

// 计算线段动态点坐标
export function interpolatePointsByRatio(path: any, ratio:number) {

    const inputs = path.map((point:any, index:number)=> {
        return index
    })
    const _t = ease.easeLinear(ratio)
    const callFun = piecewise((point, point1)=> {
        return interpolateArray(point, point1)
    }, path)
    let index = binarySearch(inputs, _t * (path.length - 1))
    const endPoint = callFun(_t)
    let points = []
    endPoint && points.push(endPoint)
    while(index >=0 ) {
        path[index] && points.push(path[index])
        index --
    }
 
    return points.reverse()
}


interface AnimationOptions {
    /* 起始帧 默认 0*/ 
    from?: number,
    /* 终止帧 默认 1*/ 
    to?: number,
    /* 每次动画持续播放的时间*/ 
    duration?: number,
    /* 重复多少次动画*/ 
    repeat?: number,
    /* 动画帧更新 */ 
    onUpdate?: (t: number) => void,
    /* 动画唯一ID */ 
    id?: string,
    /* 是否开启交替循环动画  */ 
    reverse?: boolean
}
// 创建动画
export function createAnimation(options?: AnimationOptions) {
    let { id, to, from, repeat, duration, onUpdate, reverse } = (options || {});
    if (!id) id = Math.random().toString();
    if (!to) to = 1;
    if (!from) from = 0;
    if (!repeat) repeat = Infinity;
    if (!duration) duration = 2000;
    // 播放动画次数
    let repeatNum = 1
    let time = from
    let clock = new Clock()
    let length = to - from
    // reverse为true生效  交替循环动画 
    let isReverse = false
    addAnimation(id, () => {
        isReverse ? time -= clock.getDelta() : time += clock.getDelta()
        let _time = (time * 1000) / (duration as number) * length
        if (isReverse ? _time < (from as number) : _time > (to as number)) {
            if(reverse) {
                isReverse = !isReverse
            }else {
                time = (from || 0)
            }
            repeatNum++
            return
        }
        onUpdate && onUpdate(_time)
        if (repeatNum > (repeat as number)) {
            removeAnimation(id)
        }
    })

    return {
        stop: clock.stop,
        start: clock.start,
        remove: () => { removeAnimation(id) }
    }
}


/** 运行动画 */
export function animateRun() {
    animate.forEach((fun) => {
        fun && fun()
    })

}

// 开始动画
export function animateStart() {
    const id = requestAnimationFrame(animateRun);
    animateIds.add(id)
    return id
}

// 停止动画
export function animateStop(id?: number) {
    if (id) {
        cancelAnimationFrame(id)
    } else {
        animateIds.forEach((_id) => {
            cancelAnimationFrame(_id)
        })
    }
}
