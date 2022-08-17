
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////
import { MxMapBox } from "../init";
import * as turf from "@turf/turf"

// 自定义图标动画
export function customIconAnimation() {
    // 获取当前地图范围
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox

    // 根据范围生成随机的点数据
    const points = turf.randomPoint(6000, { bbox })
    const size = 200
    const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
    
        // 将图层添加到地图时获取地图画布的渲染上下文
        onAdd: function(this:any) {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },
    
        // 在将使用图标的每一帧之前调用一次
        render: function(this:any) {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;
    
            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;
    
            // 绘制外面的圆
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
            context.fill();
    
            //绘制里面的圆
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();
    
            // 使用画布中的数据更新此图像的数据
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;
    
            // 不断地重绘地图，导致圆点的平滑动画
            map.triggerRepaint();
    
            // 返回 `true` 让地图知道图像已更新
            return true;
        }
    };
    // 添加图片
    map.addImage('customIconAnimation_pulsing_dot', pulsingDot, { pixelRatio: 2 });

    // 添加图层
    map.addLayer({
        id: "customIconAnimation",
        type: "symbol",
        source: {type: "geojson", data: points},
        layout: {
            'icon-image': 'customIconAnimation_pulsing_dot',
            'icon-rotation-alignment': 'auto',
            'icon-allow-overlap': false,
        }
    })
}