# CAD与GIS集成说明


## mapbox地图与cad图纸的集成示例代码说明

点击[演示示例](https://www.mxdraw3d.com/sample/vuemapbox/?cmd=Mx_CADGISDemo&autoinit=n)查看效果

点击[下载示例源码](https://github.com/mxcad/VueMapboxMxdraw/archive/refs/heads/main.zip) 

mapbox-gl.js是通过webgl渲染交互式地图的js库 利用mapbox提供的自定义图层实现渲染mxdraw中的CAD图纸(three.js 场景)。

如果不了解mapbox-gl.js可以参考中文[官方文档](http://www.mapbox.cn/mapbox-gl-js/api/) / [国际站](https://www.mapbox.com/)

> [什么是mxdraw?](https://mxcadx.gitee.io/mxdraw_docs/)

mxdraw是基于three.js进行二次开发实现在线CAD图纸的预览，所以本质上我们还是是以mapbox-gl为主，将three.js中的物体对象显示在mapbox-gl的一个自定义图层中。

下面代码是mapbox和mxdraw结合使用的示例代码。

先安装对应的依赖包:

```sh
npm install mapbox-gl mxdraw three@0.113.2
```

``` html
<div id="map"></div>
```

``` js
import mapboxgl from "mapbox-gl";
import Mx from "mxdraw"
import * as THREE from "three"

// token需要自己在mapbox官网申请
mapboxgl.accessToken = "pk.eyJ1IjoibWFvcmV5IiwiYSI6ImNqNWhrenIwcDFvbXUyd3I2bTJxYzZ4em8ifQ.KHZIehQuWW9AsMaGtATdwA"

// 北京位置的经纬度
const center = [116.391305, 39.90553]

const map = new mapboxgl.Map({
     // Mapbox GL JS 进行地图渲染的 HTML 元素，或该元素的字符串 id 。该指定元素不能有子元素。
    container: 'map',
    // 地图位置
    center,
    // 地图样式
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 16
})

// 图纸或者模型的高度
const modelAltitude = 100;

// 将 LngLat 投影转换为 墨卡托投影坐标
const point = mapboxgl.MercatorCoordinate.fromLngLat(
    center,
    modelAltitude
);
// 返回在此纬度上以墨卡托坐标单位表示的1米距离。
// 对于现实世界中使用米单位的坐标，这自然提供了转换为墨卡托投影坐标的比例尺
const lDistForM = point.meterInMercatorCoordinateUnits();

// 当前决定该cad图纸在现实中的范围是1公里
const lCADArea = 1000 * lDistForM * 1;

// 提供一些必要的mapbox信息，并且赋予了一些mxdraw提供的核心方法
let mxMap = {
    // mapbox生成的canvas元素
    canvas: null,
    // 自定义图层提供的gl上下文
    gl: void 0,
    // cad图纸的位置1
    cadLocation1: new THREE.Vector3(),
    // cad图纸的位置2
    cadLocation2: new THREE.Vector3(),
    // 海拔高度
    elevation: 0,
    // 自定义图层信息
    customLayer: {},
    // cad图纸控件对象
    mxObj: null,
    // 坐标系转换的矩阵1
    matCadToMap: new THREE.Matrix4(),
     // 坐标系转换的矩阵1
    matMapToCad: new THREE.Matrix4(),
    // 自定义图层的矩阵
    matrix: void 0,
    // 渲染函数
    render(gl, matrix){

    },
    /** 坐标系相互转换的方法 */ 
    cadToMercatorCoord(pt) {
        pt.applyMatrix4(this.matCadToMap);
        return new mapboxgl.MercatorCoordinate(pt.x,pt.y,pt.z); 
    },
    
    mercatorCoordToCad(pt){
        let ptRet = new THREE.Vector3(pt.x,pt.y,pt.z);
        ptRet.applyMatrix4(this.matMapToCad);
        return ptRet; 
    },

    cadLongToMercatorCoord(len){
        let pt1 = new THREE.Vector3(0,0,0);
        let pt2 = new THREE.Vector3(len,0,0);
        pt1.applyMatrix4(this.matCadToMap);
        pt2.applyMatrix4(this.matCadToMap);
        return pt1.distanceTo(pt2);
    }

}
// 通过以上信息从而确定cad图上的具体位置
mxMap.cadLocation1 = new THREE.Vector3(point.x - lCADArea / 2, point.y - lCADArea, point.z);
mxMap.cadLocation2 = new THREE.Vector3(point.x + lCADArea, point.y + lCADArea / 2, point.z);

// 新增一个mapbox自定义图层
const customLayer = {
    id: "3d-model", // 任意不重复的ID
    type: "custom",
    renderingMode: "3d",
    async onAdd(map, gl) {
        // 同步加载mxdraw核心库
        await Mx.loadCoreCode()
        // 拿到mapbox的canvas元素
        mxMap.canvas = map.getCanvas();
        // 以及webgl上下文
        mxMap.gl = gl
        // 创建图纸控件对象
        Mx.MxFun.createMxObject({
            // mapBox 提供 mapbox的一些必要参数
            mapBox: mxMap,
            // 要打开的图纸
            cadFile: "../../demo/buf/$hhhh.dwg",
            callback: (mxObj) => {
                mxMap.mxObj = mxObj;
                mxObj.addEvent("loadComplete", () => {
                    // 更新mapbox
                    map.triggerRepaint()
                });
            }
        }); 
  
    },
    render(gl, matrix) {

        // 赋值矩阵信息
        mxMap.matrix = matrix
        // 在创建图纸后会提供一个渲染函数,用于更新图纸
        mxMap.render(gl, matrix);

        // 刷新mapbox
        map.triggerRepaint()
    }
};
// 赋值这个自定义图层的信息
mxMap.customLayer = customLayer
//  添加自定义图层

map.on('style.load', ()=> {
    // 添加自定义图层
    map.addLayer(customLayer)
})
```

## mapbox集成更多其他库的能力

### mapbox 与 L7框架

我们可以在mapbox基础上扩展L7框架的能力 使mapbox的功能更加强大

L7 是由蚂蚁金服 AntV 数据可视化团队推出的基于 WebGL 的开源大规模地理空间数据可视分析开发框架

点击 [AntV L7 官方文档](https://antv-l7.gitee.io/zh/docs/api/l7) 查看使用L7提供的功能

以下是简单的L7结合mapbox的集成代码：

```html
<div id="map"></div>
```

```js
import { Scene, Mapbox } from "@antv/l7"
import mapboxgl from "mapbox-gl";
// 首先创建mapbox地图
mapboxgl.accessToken = "pk.eyJ1IjoibWFvcmV5IiwiYSI6ImNqNWhrenIwcDFvbXUyd3I2bTJxYzZ4em8ifQ.KHZIehQuWW9AsMaGtATdwA"
const map = new mapboxgl.Map({
    container: 'map',
    center,
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 16
})

// 实例化L7提供的场景
const l7Scene = new Scene({
    id: 'map',
    logoVisible: false,
    // 这里提供mapbox的地图
    map: new Mapbox({
        mapInstance: map
    })
})
```

按照上述代码，在mapbox地图上就可以使用L7提供的能力了。

更加详细的代码请参考源码示例中 src/L7 文件夹的代码 点击查看：[github](https://github.com/mxcad/VueMapboxMxdraw/tree/main/src/L7) / [gitee](https://gitee.com/mxcadx/VueMapboxMxdraw/tree/main/src/L7)

### mapbox 与 deck.gl

deck.gl 是一个webgl支持的框架，用于对大型数据集进行可视化探索性数据分析。

点击 [deck.gl文档](https://deck.gl/docs) 查看使用说明 

deck.gl 可以做到与mapbox无缝衔接 集成方法可以看[@deck.gl/mapbox模块的使用文档](https://deck.gl/docs/api-reference/mapbox/overview)

也可以通过 查看示例源码中的src/deckgl文件夹 查看deck.gl是如何在mapbox-gl 中使用的(每一个TS文件代表一个单独的示例), 

前往[github](https://github.com/mxcad/VueMapboxMxdraw/tree/main/src/deckgl) / [gitee](https://gitee.com/mxcadx/VueMapboxMxdraw/tree/main/src/deckgl) 查看源码。


### mapbox 与 three.js

因为mxdraw库是基于three@0.113.2进行二次开发的(因为对源代码进行了一些修改，建议只使用three@0.113.2这个版本)。

添加的CAD图纸本质上是由three.js的物体对象构成的，所有我们也可以添加其他的three.js的物体对象。

点击 [three.js中文文档](https://www.wenjiangs.com/wp-content/uploads/three.js/docs/index.html) 或者 [three.js官方文档](https://threejs.org/) 查看具体API使用说明

在示例源码中的src/mxthree文件夹中也提供了一些写好的物体对象加载到mapbox地图中的示例代码 

可以通过在 [github](https://github.com/mxcad/VueMapboxMxdraw/tree/main/src/mxthree) 或者 [gitee](https://gitee.com/mxcadx/VueMapboxMxdraw/tree/main/src/mxthree) 查阅具体的代码实现


## VueMapboxMxdraw示例源码的详细说明

### 概述

首先，示例源码是基于Vue3和mapbox-gl实现的一个交互式地图示例展现页面，比如上述与各其他由webgl封装的各种可以和mapbox-gl集成的前端库的使用示例，以及CAD图纸展现在mapbox-gl地图中的示例，我们可以理解为mxdraw是专注处理CAD图纸的渲染，而mapbox-gl 是地图的渲染， 其他展示的库也都是围绕mapbox-gl展开的。

### 初始化

整个初始化流程是: Vue-> mapbox-gl -> mxdraw -> 示例入口函数

所以的初始化函数都叫 `init`

1. 首先可以我们应该找到src/components文件夹中的HelloWorld.vue 在其中就可以找到 init 方法， 就是执行mapbox的初始化工作。

2. mapbox-gl 的初始化就包含了mxdraw 的初始化工作，我们可以在 src/mapbox/init.ts 中找到init 方法 在地图样式加载完成的事件中可以找到如下代码 其中 `mxDrawInit`就是 mxdraw 的初始化(该函数可以在src/mxdraw/init方法中找到)

```js
 // ...
 map.on("style.load", async () => {
    // ...
    let kilometers = param.kilometers ? param.kilometers: 1;

    // 初始化图纸显示
    mxMap = await mxDrawInit(map, ptCADOrigin,kilometers, cadFile);
    // ...
});
```

3. 在mxdraw的初始化中，`cmdInit`通过命令模式注册 各种示例的入口函数. 在src/mxdraw/cmdInit.ts可以看见所有的示例入口函数，可以根据文件引入位置查看对应的示例代码文件， 如下代码所示：
```js
import { addMinMpaContorl } from "@/mapbox/control/addMinMpaContorl"
// ...
MxFun.addCommand('addMinMpaContorl', addMinMpaContorl)
// ... 
```

### 示例切换

示例切换就是执行对应的在初始化时注册的命令， 在src/components/MyMenu.vue 中可以看到每个菜单按钮数据都有个cmd属性，就表示其对应的命令。

每次执行一个命令前都会删掉当前mapbox-gl 的Map对象 重新初始化mapbox, 在整个删除过程中会涉及到mxdraw绘制three的资源没有得到释放的问题， 可以在src/mxdraw/init.ts 中找到如下代码：
```js
map.on('remove',()=> {
    // 地图删除触发对图纸的销毁函数
    beforeDestroy()
})
```
可以在 src/mxdraw/ResourceTracker.ts 中就专门为three的资源释放和追踪提供的方法类， 这样在删除地图，资源得到释放后，就不会造成页面卡顿现象了。

### 其他目录(mapbox为主)文件简要说明

* src/mapbox/Map 是对mapbox-gl中的Map类的一次封装， 重构或者新增了一些方法， 在如给标记点设置高度、线段3D拉伸等地方可能会用到这些方法。

* src/animate.ts 利用了"d3-ease"提供的线性插值的能力封装了对应的方法， 提供了创建线性动画的方法以及添加动画等

* src/mapbox/graphics 是对mapbox 使用图层展示 geojson数据的一个封装，可以创建一个自由操作的不同类型的不同形状的图形，以及基于这个去图形类去实现更多图形的示例

* src/mapbox/draw 主要是对mapbox-gl-draw 提供的绘制能力进行了封装，其中主要是绘制工具条和绘制能力的封装， 展示了如何扩展mapbox-gl-draw的绘制功能， 对杂乱且不兼容的各种扩展的绘制能力进行了一定程度的整合兼容。

* src/mapbox/animate 是一些动画效果的示例

* src/mapbox/calculate 是结合 turf 这个库 使用geojson数据参与计算的示例

* src/mapbox/control 是mapbox 的各种控件使用示例，如上说的mapbox-gl-draw就是一个控件

* src/mapbox/demo 是mapbox的一些demo示例，如mapbox加载three.js的3D城市、地图中加载对应位置的CAD图纸等等

* src/mapbox/layer 是mapbox的一些常见使用图层的示例

* src/mapbox/plugins 是一些常见的插件， 如city 就是加载3d城市，InternetMap就是加载各种第三方地图...

* src/mapbox/pointTag 就是实现各种点标记的效果的示例

* src/mapbox/style 提供了各种mapbox的地图样式的配置信息

* patches文件夹中是修改node_modules 中一些依赖包的记录， 都是一些小改动，主要是解决一些整合功能出现的兼容性问题
