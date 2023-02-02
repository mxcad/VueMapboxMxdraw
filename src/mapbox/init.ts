///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./pointTag/index.css";
import { accessToken, getNoStyle, mapOrigin, getGaodeStyle } from "./index";
import { init as mxDrawInit, MxMap } from "../mxdraw/init";

import { init as l7Init, l7Scene } from "@/L7";
import { Map } from "./Map";
import * as turf from "@turf/turf";
import * as THREE from "three";
import { loadCoreCode, MxFun } from "mxdraw";
import { Mx_CADGISDemo } from "./demo/Mx_cadandgis";

//export let map: Map
let map: Map;
let mxMap: MxMap;

export namespace MxMapBox {
    export function getMap() {
        return map;
    }

    export function getMxMap() {
        return mxMap;
    }

    export async function init(param: any) {
        // 填写自己在mapbox官网上申请的accessToken
        mapboxgl.accessToken = accessToken;

        // 如果使用了 L7 则销毁该实例
        l7Scene && l7Scene.destroy();

        // 获取对应的id为map的HTML元素
        let mapEl = document.getElementById("map");
        if (!mapEl) {
            mapEl = document.createElement("div");
            mapEl.id = "map";
            const parent = document.getElementsByTagName("main")[0] || document.body;
            parent.appendChild(mapEl);
        }

        //  图纸中的中心在地址上的位置，单位经纬度
        let ptMapOrigin = param.mapOrigin ? param.mapOrigin : mapOrigin;

        //  CAD图纸中的中心中，CAD图纸单位
        let ptCADOrigin = param.cadOrigin ? param.cadOrigin : [0, 0];

        // 一个CAD绘图单位，是现实中多少米.
        let meterInCADUnits = param.meterInCADUnits ? param.meterInCADUnits : 1;

        let zoom = param.zoom ? param.zoom : 16;

        let mapParam = param.mapparam;
        if (!mapParam) {
            mapParam = {
                // Mapbox GL JS 进行地图渲染的 HTML 元素，或该元素的字符串 id 。该指定元素不能有子元素。
                container: "map",

                // 地图最小缩放级别（0-24）。
                minZoom: 0,

                // 地图最大缩放级别（0-24）。
                maxZoom: 24,

                // 地图的 Mapbox 配置样式
                style: getNoStyle(),

                // 如果为 true ，地图的位置 (包括缩放层级、中心纬度、中心经度、方位角和倾角) 将会与页面URL的哈希片段同步。例如， http://path/to/my/page.html#2.59/39.26/53.07/-24.1/60
                hash: false,

                // 如果为 false ，地图将不会绑定对鼠标、触碰、键盘的监听，因此地图将不会响应任何用户交互
                interactive: true,

                // 定义何时地图的方位将自动对齐到正北方向的阈值（以度为单位）。例如，当 bearingSnap 为 7 时，如果用户将地图转动到正北方向 7 度以内的范围时，地图将自动恢复对齐到正北方向
                bearingSnap: 7,

                // 如果为 false ，将不会在"拖拽进行地图旋转"的同时控制地图的倾斜。
                pitchWithRotate: true,

                // 当用户点击地图时能进行鼠标移动的最大像素范围，点击地图后鼠标在此像素范围内移动则被认为是一次有效的点击(而不是拖拽)。
                clickTolerance: 3,

                // 如果为 true ， AttributionControl(一个 AttributionControl 控制展示地图的属性信息。http://www.mapbox.cn/mapbox-gl-js/api/#attributioncontrol) 将会被添加到地图上。
                attributionControl: true,

                // 在 attributionControl 中显示的字符串或字符串数组。仅当 options.attributionControl 为 true 时生效。
                customAttribution: [],

                // 设置 Mapbox 文字商标在地图上的位置。可选填以下值 top-left ， top-right ， bottom-left ， bottom-right 。
                logoPosition: "bottom-left",

                // 如果为 true ， 当 Mapbox GL JS 的性能远远低于预期的时候，地图将创建失败。 (换句话说，此时可能是用的软件渲染器)。
                failIfMajorPerformanceCaveat: false,

                // 如果为 true ，地图画布可通过 map.getCanvas().toDataURL() 输出 PNG 。出于性能优化考虑，该值默认为 false 。
                preserveDrawingBuffer: false,

                // 如果为 true ，gl 渲染环境在创建时将开启多重采样抗锯齿模式（ MSAA ）, 这对自定义图层的抗锯齿十分有效。出于性能优化考虑，该值默认为 false 。
                antialias: false,

                // 如果为 false ，一旦切片的 HTTP cacheControl / expires headers 过期，地图将不会重新请求这些切片。
                refreshExpiredTiles: true,

                // 设置一个LngLatBounds对象（http://www.mapbox.cn/mapbox-gl-js/api/#lnglatboundslike），或者是一个LngLatLike对象的数组以[西南，东北]为顺序， 也可以是一个数字组成的数组以[西，南，东，北]为顺序。 设置之后，地图将限制在给定的最大范围内。
                maxBounds: void 0,

                // 如果为 true ，将开启 "滚轮缩放地图" 交互模式。如果传值为 Object 对象，对象可选参数参考 http://www.mapbox.cn/mapbox-gl-js/api/#scrollzoomhandler enable
                scrollZoom: true,

                // 如果为 true , 将开启 "框选缩放地图" 交互模式  http://www.mapbox.cn/mapbox-gl-js/api/#boxzoomhandler#disable
                boxZoom: true,

                // 如果为 true , 将开启 "拖拽旋转地图" 交互模式  http://www.mapbox.cn/mapbox-gl-js/api/#dragrotatehandler
                dragRotate: true,

                // 如果为 true , 将开启 "拖拽移动地图" 交互模式 http://www.mapbox.cn/mapbox-gl-js/api/#dragpanhandler
                dragPan: true,

                // 如果为 true ，将启用键盘快捷键功能 http://www.mapbox.cn/mapbox-gl-js/api/#keyboardhandler
                keyboard: true,

                // 如果为 true ，将开启 "双击缩放地图" 交互模式 http://www.mapbox.cn/mapbox-gl-js/api/#doubleclickzoomhandler
                doubleClickZoom: true,

                // 如果为 true ，将开启 "捏合旋转、缩放" 交互模式。http://www.mapbox.cn/mapbox-gl-js/api/#scrollzoomhandler  enable
                touchZoomRotate: true,

                // 如果为 true ，地图将自适应窗口大小变化。
                trackResize: true,

                // 地图初始化时的地理中心点。如果构造函数的参数中没有设置 center ，Mapbox GL JS 会在地图样式中进行查找。如果样式中也没定义的话，那么它将默认为 [0, 0] 注意: 为了与 GeoJSON 保持一致，Mapbox GL 采用经度，纬度的顺序 (而不是纬度，经度)。
                center: ptMapOrigin,

                // 地图初始化时的层级。如果构造函数的参数中没有设置 zoom Mapbox GL JS 会在地图样式中进行查找。如果样式中也没定义的话，那么它将默认为 0
                zoom: zoom,

                // 地图初始化时的方位角（旋转角度），以正北方的逆时针转动度数计量
                bearing: 0,

                // 地图初始化时的倾角，按偏离屏幕水平面的度数计量（0-60）
                pitch: 0,

                // 设置一个LngLatBounds对象（http://www.mapbox.cn/mapbox-gl-js/api/#lnglatboundslike  地图初始化时的限制范围。如果设置了 bounds 将会覆盖掉 center 和 zoom 在构造函数中的参数设置
                bounds: void 0,

                // fitBounds 仅用于 初始化地图时自适应设置的 bounds 范围时的情况。 http://www.mapbox.cn/mapbox-gl-js/api/#map#fitbounds
                fitBoundsOptions: void 0,

                // 如果为 true ，地图缩小时将渲染多个全局地图的副本。
                renderWorldCopies: true,

                // 设置当前数据源存储在切片缓存中的最大切片数目。如果不设置，将基于当前视角动态计算切片缓存大小。
                maxTileCacheSize: void 0,

                // 定义一个用于在本地替代通用‘中日韩越统一表意文字’，’平假名’，‘片假名’和‘朝鲜文音节’字形的 CSS 字体系列。 在上述字体在地图样式中的设置，除字体粗细（light/regular/medium/bold）外，都将被忽略。 当设置为 false ，上述字体则使用地图样式中的设置。 该参数的目的是为了避免超带宽的字形请求 https://docs.mapbox.com/mapbox-gl-js/example/local-ideographs/
                localIdeographFontFamily: "sans-serif",

                // 地图发送外部 URL 请求前执行的回调函数。回调函数中可修改 URL 、设置请求头或设置跨源请求的相关身份凭证。回调返回的对象参数包含 url 属性和可选的 headers 以及 credentials 属性。
                transformRequest: void 0,

                // 如果为 true ，那么将为 GeoJSON 和 Vector Tile web workers 发出的请求搜集资源耗时API信息（通常无法从 Javascript 主线程中访问此信息）。该信息将在 resourceTiming 属性中返回（对应于 data 事件）
                collectResourceTiming: false,

                // 控制标注冲突时，淡入淡出的动画过渡时间, 单位为毫秒。该设置将应用于所有 symbol 图层。对于运行时的样式变化和栅格切片的淡入淡出，此设置不生效。
                fadeDuration: 300,

                // 如果为 true ，来自不同数据源的符号将共同参与到碰撞检测中。如果为 false ，仅在各自的数据源中相互独立的进行符号的碰撞检测。
                crossSourceCollisions: true,

                // 设置之后，地图将用此 token 替换掉在 mapboxgl.accessToken 中设置的值。
                accessToken: accessToken,
            };
        }

        map = new Map(mapParam);
  
        // 监听地图样式加载
        map.on("style.load", async () => {
            // 加载用于图层分隔的空图层 (层级优先: 点 > 线 > 面 )
            map.addGroupLayer();
         
            let cadFile: string = param.cadFile;
            if (!cadFile) {
                cadFile = "empty.dwg";
            }

            // 初始化图纸显示
            mxMap = await mxDrawInit(map, ptMapOrigin, ptCADOrigin, meterInCADUnits, cadFile);
            
            if (param.call) {
                param.call(map, mxMap);
            }
        });
    }
}

function getQueryString(name: string): string {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return "";
}

// 初始化 mapbox
export function init(cmd?: string) {
    let autoInit = true;
   
    if (!cmd) {
        // 可改通过地址参数，启动相应demo.
        // http://localhost:8088/?cmd=Mx_Personnel_positioning
        // http://localhost:8088/?cmd=Mx_CADGISDemo&autoinit=n

        cmd = getQueryString("cmd");
        let autoInitSet = getQueryString("autoinit");
        if (autoInitSet && autoInitSet.length > 0) {
            autoInit = autoInitSet == "y";
        }

        if (!autoInit) {
            
            loadCoreCode().then(() => {
                MxFun.addCommand("Mx_CADGISDemo", Mx_CADGISDemo);
                MxFun.sendStringToExecute(cmd as string);
            });

            return;
        }
      
    }

    //  图纸中的中心在地址上的位置，单位经纬度
    let ptMapOrigin = mapOrigin;

    //  CAD图纸中的中心中，CAD图纸单位
    let ptCADOrigin: [number, number] = [578534.364205,411688.892661];

     // 一个CAD绘图单位，是现实中多少米.
    let meterInCADUnits = 0.001;

    let cadFile = "/demo/buf/mapcad.dwg";
    MxMapBox.init({
        mapOrigin: ptMapOrigin,
        cadOrigin: ptCADOrigin,
        meterInCADUnits: meterInCADUnits,
        cadFile: cadFile,
        call: async () => {
       
            // 拿到图纸的一些数据(数据由后端获取图纸数据并返回对应的json数据)
            const data = await fetch("./demo/mapcad.dwg.json");
            const { borderWireFrame } = await data.json();
       
            // 拿到边框的线框点数据
            const _borderPoints = borderWireFrame.map((pt: { x: number; y: number; z: number }) => {
                return new THREE.Vector3(pt.x, pt.y, pt.z);
            });


            // 根据图纸边框计算包围盒和中心点
            const box = new THREE.Box3().setFromPoints(_borderPoints);
            const _center = box.getCenter(new THREE.Vector3());

            // 将three.js的Vector3 转换为mapbox的经纬度
            let mePoint = mxMap.cadToMercatorCoord(_center);
            let minPoint = mxMap.cadToMercatorCoord(box.min);

            // 通过创建两个点标记拖动控制图纸的大小
            // 默认距离（公里）
            let distance = 1;
            // 拖动可以根据图纸中点的位置和拖动的位置的X轴距离放大或缩小图纸
            const minMarker = new mapboxgl.Marker({})
                .setLngLat(minPoint.toLngLat())
                .addTo(map)
                .setDraggable(true)
                .on("drag", async (e: any) => {
                    const { lng, lat } = e.target._lngLat;
                    const center = centerMarker.getLngLat() || mePoint.toLngLat();
                    map.getLayer("3d-model") && map.removeLayer("3d-model");
                    // 计算两个经纬度坐标的距离(公里)
                    distance =
                        turf.rhumbDistance([center.lng, center.lat], [lng, center.lat], {
                            units: "kilometers",
                        }) * 2;
                    mxMap = await mxDrawInit(map, [center.lng, center.lat], ptCADOrigin, meterInCADUnits, cadFile);
                });
            // 拖动可改变图纸中心点位置，并根据另一个标记点位置的X坐标轴确定图纸大小
            const centerMarker = new mapboxgl.Marker()
                .setLngLat(mePoint.toLngLat())
                .addTo(map)
                .setDraggable(true)
                .on("drag", async (e: any) => {
                    const center = e.target._lngLat;
                    const { lng, lat } = minMarker.getLngLat() || minPoint.toLngLat();
                    map.getLayer("3d-model") && map.removeLayer("3d-model");
                    distance =
                        turf.rhumbDistance([center.lng, center.lat], [lng, center.lat], {
                            units: "kilometers",
                        }) * 2;
                    mxMap = await mxDrawInit(map, [center.lng, center.lat], ptCADOrigin, meterInCADUnits, cadFile);
                });

            let points: number[][] = [];
            map.on("click", async function (e) {
                const { lng, lat } = e.lngLat;
                console.log("经纬度坐标:", JSON.stringify([lng, lat]));
                const pt = turf.point([lng, lat]);
                points.push([lng, lat]);
                // console.log(JSON.stringify(points))
            });

            
            if (cmd) {
                console.log(cmd);
                MxFun.sendStringToExecute(cmd);
            }
        },
    });
}
