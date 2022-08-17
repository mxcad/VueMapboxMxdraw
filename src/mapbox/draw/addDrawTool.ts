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
import MapboxDrawerApi from '@dijiang/front_mapbox_custom_draw'
import themeStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import "./css/addDrawToolSnap.css"

// 缩放功能
import { SRCenter } from 'mapbox-gl-draw-scale-rotate-mode';
import modes from "./modes";
import styles from "./styles";
import ExtendDrawBar from "./ExtendDrawBar";
import { LineStringInfoControl, PolygonInfoControl, MultiLineInfoControl, PointInfoControl, TextInfoControl } from "./infoControl";
import createHistory from "./history";
// 修改全局样式
const _styles = MapboxDrawerApi.getStyles()
// 原主题中有样式但 MapboxDrawerApi中没有的样式就添加进去
themeStyles.forEach((style: any) => {
    let index = _styles.findIndex((_style: any) => _style.id === style.id)
    if (index < 0) _styles.push(style)
})
//  遍历全局样式 修改一些需要集体修改的部分
const defaultStyles = _styles.map((defaultStyle: any) => {
    // 加入 snap 辅助过滤样式
    if (defaultStyle.id === 'gl-draw-line-inactive') {
        return {
            ...defaultStyle,
            filter: [
                ...defaultStyle.filter,
                ['!=', 'user_isSnapGuide', 'true'],
            ],
        };
    }
    return defaultStyle;
});
MapboxDrawerApi.setStyles(defaultStyles)


// 添加绘制控件工具条
export function addDrawTool() {

    let map = MxMapBox.getMap();
    // 初始化自定义的绘制图形的API
    const drawerApi = new MapboxDrawerApi(map as any, {
        displayControlsDefault: true,
        styles,
        modes,
        // 配置拍摄功能
        snap: true,
        snapOptions: {
            snapPx: 15, // defaults to 15 捕捉到线/段的最小距离（以像素为单位）将生效。
            snapToMidPoints: true, // defaults to false 控制是否捕捉到线/线段的中点（每个线段中间的假想点）。
            snapVertexPriorityDistance: 0.000000125, // defaults to 1.25 到每个顶点的最小距离（以千米为单位），其中捕捉到该顶点将优先于捕捉到线/段。
        },
        // 辅助线
        guides: true,
        guidesOptions: {
            offset: 0.001 //  defaults to 0.001 网格辅助线捕捉的偏移量
        }
    })

    // 获取绘制控件
    const draw = drawerApi._draw
    // 历史记录对象
    const history = createHistory(draw, map)
    // 注册监听事件
    history.addEventListeners()

    // 调用绘制功能的方法
    const chengeDraw = (type: string) => { drawerApi.switchDrawTool(type, { unit: 'm' }) }
    // 图形旋转的调用方法
    const scaleRotate = () => {
        try {
            draw.changeMode('scaleRotateMode' as any, {
                canScale: true, // 开启缩放
                canRotate: true, // 开启旋转
                canTrash: false, // 是否可以回退删除

                rotatePivot: SRCenter.Center, // 旋转中点
                scaleCenter: SRCenter.Opposite, // 围绕对顶点缩放

                singleRotationPoint: true, // 只有一个旋转点
                rotationPointRadius: 1.2, // 旋转点半径大小

                canSelectFeatures: true, //开启选择功能
            } as any);
        } catch (err) {
            console.error(err);
        }
    }
    const buttons = [
        {
            title: '任意线',
            type: 'freeline',
            icon: 'icon-jurassic_curve',
        },
        {
            title: '线性箭头',
            type: 'straightarrow',
            icon: 'icon-jiantou_youshang',
        },
        {
            title: '曲线',
            type: 'curve',
            icon: 'icon-pingquxian',
        },
        // {
        //     title: '圆',
        //     type: 'circle',
        //     icon: 'icon-xingzhuang-tuoyuanxing',
        // },
        {
            title: '椭圆',
            type: 'ellipse',
            icon: 'icon-tx-tuoyuanxing',
        },
        // {
        //     title: '矩形',
        //     type: 'rectangle',
        //     icon: 'icon-juxing',
        // },
        // {
        //     title: '扇形',
        //     type: 'sector',
        //     icon: 'icon-shanxing',
        // },
        {
            title: '闭合曲线',
            type: 'closecurve',
            icon: 'icon-pingquxian',
        },
        {
            title: '同向双箭头',
            type: 'doublearrow',
            icon: 'icon-aaa',
        },
        {
            title: '任意转折箭头',
            type: 'tailsquadarrow',
            icon: 'icon-xiangyou',
        },
        {
            title: '文字',
            type: 'text',
            icon: 'icon-ziti',
        },

    ].map(({ type, title, icon }) => {
        // 新增的按钮
        return {
            on: 'click',
            action: () => {
                chengeDraw(type)
            },
            classes: ['iconfont', icon],
            title
        }
    })


    // 绘制按钮工具条
    const drawBar = new ExtendDrawBar({
        draw,
        buttons: [
           
            {
                on: "click",
                action: () => {
                    draw.changeMode('draw_rectangle')
                },
                classes: ['iconfont', 'icon-juxing'],
                title: "矩形"
            },
            {
                on: "click",
                action: () => {
                    draw.changeMode('draw_assisted_rectangle')
                },
                classes: ['iconfont', 'icon-juxing1'],
                title: "矩形辅助"
            },
            {
                on: "click",
                action: () => { draw.changeMode("draw_bezier_curve") },
                classes: ["bezier-curve-icon"],
                title: '贝塞尔曲线'
            },
            {
                on: 'click',
                action: scaleRotate,
                classes: ['iconfont', 'icon-mianxingxuanzhuan180dutubiao'],
                title: "选中缩放旋转"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode("pinning_mode");
                },
                classes: ['iconfont', 'icon-dianji'],
                title: "重叠点同步拖动"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode("draw_ellipse");
                },
                classes: ['iconfont', 'icon-tx-tuoyuanxing'],
                title: "椭圆"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode("static");
                },
                classes: ['iconfont', 'icon-disable_editor'],
                title: "静态模式(静止编辑)"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode("simple_select");
                },
                classes: ['iconfont', 'icon-xuanze'],
                title: "选择模式"
            },
            {
                on: 'click',
                action: () => {
                    const selectedFeatures = draw.getSelected().features;
                    if (!selectedFeatures.length) return;
                    let unionPoly: any;
                    try {
                        unionPoly = (turf.union as any)(...selectedFeatures);
                    } catch (err) {
                        console.log(err)
                    }
                    if (unionPoly.geometry.type === 'GeometryCollection') return console.log('所选特性必须具有相同的类型');

                    let ids = selectedFeatures.map((i:any) => i.id) as any;
                    draw.delete(ids);
                    unionPoly.id = ids.join('-');

                    draw.add(unionPoly);
                    draw.changeMode('simple_select', { featureIds: [unionPoly.id] });
                },
                classes: ['iconfont', 'icon-hebing'],
                title: "合并多边形"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode('draw_arrow')
                },
                classes: ['iconfont','icon-zhuanwan'],
                title: "箭头"
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode('draw_bezier_arrow')
                },
                classes: ['iconfont', 'icon-aaa1'],
                title: "贝塞尔曲线箭头"
            },
            {
                on: 'click',
                action(this, ev) {
                    draw.changeMode('draw_circle')
                },
                classes: ['iconfont', 'icon-xingzhuang-tuoyuanxing'],
                title: "圆"
            },
            {
                on: 'click',
                action(this, ev) {
                    draw.changeMode('draw_sector')
                },
                title: '扇形',
                classes: ['iconfont', 'icon-shanxing'],
            },
            {
                on: 'click',
                action() {
                    draw.changeMode('draw_triangle')
                },
                title: '三角形',
                classes: ['iconfont', 'icon-sanjiaoxing'],
            },
            ...buttons,
            {
                on: 'click',
                action() {
                    let entsJson = draw.getAll();
                    window.localStorage.setItem('map_drawdata', JSON.stringify(entsJson));
    
                },
                title: '保存',
                classes: ['iconfont', 'icon-baocun'],
            },
            {
                on: 'click',
                action() {
                    let data = window.localStorage.getItem('map_drawdata');
                    if (data && data != "") {
                        try {
                            data = JSON.parse(data);
                            draw.set(data as any);
                        } catch (error) {
                           console.group(data)
                        }
                    }
                },
                title: '加载',
                classes: ['iconfont', 'icon-jiazai'],
            },
            {
                on: 'click',
                action() {
                    history.undoHistory()
                },
                title: '撤销',
                classes: ['iconfont', 'icon-chexiao'],
            },
            {
                on: 'click',
                action() {
                    history.redoHistory()
                },
                title: '重做',
                classes: ['iconfont', 'icon-zhongzuo'],
            },
        ],
        chekcBtns: [
            {
                on: "change",
                action: (e: any) => {
                    draw.options.snap = e.target.checked;
                },
                classes: ["snap_mode", "snap"],
                title: "点捕捉模式",
                initialState: "checked",
            },
            {
                on: "change",
                action: (e: any) => {
                    draw.options.guides = e.target.checked;
                },
                classes: ["snap_mode", "grid"],
                title: "网格捕捉模式",
                initialState: "checked",
            },
        ],
        
    })


    // LineString 线段距离指示器
    const lineStringControl = new LineStringInfoControl({
        distanceUnits: 'kilometers', // 有效的距离单位是miles,kilometers和none（如果您不想计算距离）。Turf.js 内部用于计算长度。
        drawControl: draw,
        editProperties: [
            {
                name: '_color',
                label: '颜色',
                type: 'color'
            },
            {
                name: '_width',
                label: '线宽',
                type: 'number'
            },

        ]
    })


    const multiLineInfoControl = new MultiLineInfoControl({
        drawControl: draw,
        editProperties: [
            {
                name: '_color',
                label: '颜色',
                type: 'color'
            },
            {
                name: '_width',
                label: '线宽',
                type: 'number'
            },
        ]
    })

    const textInfoControl = new TextInfoControl({
        drawControl: draw,
        editProperties: [
            // 支持任何有效的 GeoJSON 属性名称和表单标签，但该name 属性（如果存在）将显示为自定义控件的功能标题栏
            {
                name: '_size',
                label: '大小',
                type: 'number'
            },
            {
                name: '_color',
                label: '颜色',
                type: 'color'
            },
            {
                name: '_text',
                label: '文字'
            }
        ],
        // 允许自定义将在所选要素没有名称时使用的占位符，默认值基于要素的类型，例如 LineStrings 将显示为“Line”
        defaultTitle: 'Text'
    })
    // 点信息编辑控件
    const pointInfoControl = new PointInfoControl({
        drawControl: draw,
        editProperties: [
            {
                name: '_color',
                label: '颜色',
                type: 'color'
            },
            {
                name: '_size',
                label: '大小',
                type: 'number'
            }
        ],
        defaultTitle: "Point",

    })
    const polygonInfoControl = new PolygonInfoControl({
        drawControl: draw,
        defaultTitle: "Polygon",
        editProperties: [
            {
                name: '_color',
                label: '填充颜色',
                type: 'color'
            },
            {
                name: '_color_out',
                label: '外边色',
                type: 'color'
            },
            {
                name: '_width_out',
                label: '外边宽',
                type: 'number'
            },
            {
                type: 'number',
                name: '_opacity',
                label: '透明度',
            },
        ]
    })

    // 查看和编辑特征属性
    map.addControl(drawBar, 'top-right');
    map.addControl(lineStringControl, 'top-right');
    map.addControl(multiLineInfoControl, 'top-left')
    map.addControl(textInfoControl, 'top-left');
    map.addControl(pointInfoControl, 'top-left');
    map.addControl(polygonInfoControl, 'top-left')
 
    
    map.on('remove', () => {
        // 移除历史管理器兼容的绘制事件
        history.removeEventListeners()
    })
}