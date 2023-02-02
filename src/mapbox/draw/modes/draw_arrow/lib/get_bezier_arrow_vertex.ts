///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import BezierJs from 'bezier';

// 箭头生成的偏移量参数
const innerOffset = 10, outerOffset = 22, topOffset = 36;

//points_x为x坐标数组，points_y为y坐标数组，数组长度表示曲线的维度
export function getBezierVertex(ctx:any, points_x:any, points_y:any) {
    const bezierVertex = [];

    for (let t = 0; t < 1; t += 0.01) {
        const x = BezierJs(points_x, t);
        const y = BezierJs(points_y, t);
        const lnglat = ctx.map.unproject([x, y]);
        bezierVertex.push([lnglat.lng, lnglat.lat]);
    }
    return bezierVertex;
}

// 贝塞尔曲线箭头获取坐标点
export function get_bezier_arrow_vertex(ctx:any, p1: { x: number; y: number; }, p2: {x: number, y:number}, p3?: { x: any; y: any; }) {
    let coord: any[] = [];
    let head = null;
    if (p3 === void 0) {
        var p1_geo = ctx.map.unproject([p1.x, p1.y]);
        coord[0] = [p1_geo.lng, p1_geo.lat];
        head = getHeadVertex(ctx, p1, p2);
        //TODO:fixed
        if (!head) return coord;
        coord = coord.concat(head);
        coord.push(coord[0]);
    } else {
        head = getHeadVertex(ctx, p3, p2);
        //TODO:fixed
        if (!head) return coord;
        var head0 = ctx.map.project(head[0]);
        var head4 = ctx.map.project(head[4]);
        var points_lx = [p1.x, p3.x, head0.x];
        var points_ly = [p1.y, p3.y, head0.y];
        var points_rx = [head4.x, p3.x, p1.x];
        var points_ry = [head4.y, p3.y, p1.y];
        var leftSide = getBezierVertex(ctx, points_lx, points_ly);
        var rightSide = getBezierVertex(ctx, points_rx, points_ry);
        coord = coord.concat(leftSide).concat(head).concat(rightSide);
    }

    return coord;
}

//已知两个点，将其分别作为起点和终点，计算箭头头部的坐标，依次为左内、左外、顶点、右外、右内，共5个点
function getHeadVertex(ctx: any, p1: { x: number; y: number; }, p2: { x: number; y: number; }) {
    var coord = new Array(5);
    coord[2] = [p2.x, p2.y];//顶点
    var p1_p2 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));//p1-p2的距离
    if (p1_p2 === 0) {
        return;
    }
    var sina = -(p2.x - p1.x) / p1_p2;//旋转角度的正弦值
    var cosa = (p2.y - p1.y) / p1_p2;//余弦值
    // var innerR = Math.sqrt(innerOffset * innerOffset + (p1_p2 - topOffset) * (p1_p2 - topOffset));//内转点到起点的距离
    // var outerR = Math.sqrt(outerOffset * outerOffset + (p1_p2 - topOffset) * (p1_p2 - topOffset));//外转点到起点的距离
    //内转点的原始坐标（左边）
    var lInnerx = p1.x + innerOffset;
    var lInnery = p1.y + p1_p2 - topOffset;
    //外转点的原始坐标（左边）
    var lOuterx = p1.x + outerOffset;
    var lOutery = p1.y + p1_p2 - topOffset;
    var rInnerx = p1.x - innerOffset;
    var rInnery = p1.y + p1_p2 - topOffset;
    var rOuterx = p1.x - outerOffset;
    var rOutery = p1.y + p1_p2 - topOffset;
    //内外转点旋转角度a后的新坐标
    coord[0] = [p1.x + (lInnerx - p1.x) * cosa - (lInnery - p1.y) * sina, p1.y + (lInnerx - p1.x) * sina + (lInnery - p1.y) * cosa];
    coord[1] = [p1.x + (lOuterx - p1.x) * cosa - (lOutery - p1.y) * sina, p1.y + (lOuterx - p1.x) * sina + (lOutery - p1.y) * cosa];
    coord[3] = [p1.x + (rOuterx - p1.x) * cosa - (rOutery - p1.y) * sina, p1.y + (rOuterx - p1.x) * sina + (rOutery - p1.y) * cosa];
    coord[4] = [p1.x + (rInnerx - p1.x) * cosa - (rInnery - p1.y) * sina, p1.y + (rInnerx - p1.x) * sina + (rInnery - p1.y) * cosa];

    //将坐标转为经纬度
    for (var i = 0; i < coord.length; i++) {
        var lnglat = ctx.map.unproject(coord[i]);
        coord[i] = [lnglat.lng, lnglat.lat];
    }
    return coord;
}