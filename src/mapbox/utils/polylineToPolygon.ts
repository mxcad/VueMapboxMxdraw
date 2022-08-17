///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import * as turf from "@turf/turf"

// 线段转多边形
export function polylineToPolygon(path: number[][], offset: number) {
    if (path.length < 2) {
        return []
    }
    const line = turf.lineString(path)
    const offsetLine1 = turf.lineOffset(line, offset, { units: "meters" })
    const offsetLine2 = turf.lineOffset(line, -offset, { units: "meters" })
    const points = [...offsetLine1.geometry.coordinates, ...offsetLine2.geometry.coordinates.reverse(), offsetLine1.geometry.coordinates[0]]
    return [points]
}