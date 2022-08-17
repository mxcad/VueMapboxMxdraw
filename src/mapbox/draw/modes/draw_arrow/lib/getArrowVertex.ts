///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

// 箭头生成的偏移量参数
const innerOffset = 10, outerOffset = 22, topOffset = 36;

// 计算箭头偏移点位置
export function getArrowVertex(ctx:any, p1:any, p2:any) {
    const coord = [];
    coord[0] = [p1.x, p1.y];//起点
    coord[3] = [p2.x, p2.y];//顶点
    const p1_p2 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));//p1-p2的距离
    if (p1_p2 === 0) {
        return;
    }
    const sina = -(p2.x - p1.x) / p1_p2;//旋转角度的正弦值
    const cosa = (p2.y - p1.y) / p1_p2;//余弦值
    // const innerR = Math.sqrt(innerOffset * innerOffset + (p1_p2 - topOffset) * (p1_p2 - topOffset));//内转点到起点的距离
    // const outerR = Math.sqrt(outerOffset * outerOffset + (p1_p2 - topOffset) * (p1_p2 - topOffset));//外转点到起点的距离
    //内转点的原始坐标（左边）
    const lInnerx = p1.x + innerOffset;
    const lInnery = p1.y + p1_p2 - topOffset;
    //外转点的原始坐标（左边）
    const lOuterx = p1.x + outerOffset;
    const lOutery = p1.y + p1_p2 - topOffset;
    const rInnerx = p1.x - innerOffset;
    const rInnery = p1.y + p1_p2 - topOffset;
    const rOuterx = p1.x - outerOffset;
    const rOutery = p1.y + p1_p2 - topOffset;
    //内外转点旋转角度a后的新坐标
    coord[1] = [p1.x + (lInnerx - p1.x) * cosa - (lInnery - p1.y) * sina, p1.y + (lInnerx - p1.x) * sina + (lInnery - p1.y) * cosa];
    coord[2] = [p1.x + (lOuterx - p1.x) * cosa - (lOutery - p1.y) * sina, p1.y + (lOuterx - p1.x) * sina + (lOutery - p1.y) * cosa];
    coord[4] = [p1.x + (rOuterx - p1.x) * cosa - (rOutery - p1.y) * sina, p1.y + (rOuterx - p1.x) * sina + (rOutery - p1.y) * cosa];
    coord[5] = [p1.x + (rInnerx - p1.x) * cosa - (rInnery - p1.y) * sina, p1.y + (rInnerx - p1.x) * sina + (rInnery - p1.y) * cosa];
    coord[6] = coord[0];
    //将坐标转为经纬度
    for (let i = 0; i < coord.length; i++) {
        const lnglat:any = ctx.map.unproject(coord[i]);
        coord[i] = [lnglat.lng, lnglat.lat];
    }
    return coord;
}