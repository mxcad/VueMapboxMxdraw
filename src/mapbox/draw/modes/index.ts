///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import MapboxDraw from "@mapbox/mapbox-gl-draw"
import { DrawNamedLineMode } from '@wabson/mapbox-gl-feature-info';
import {
    SnapLineMode,
    inheritSnap
} from "mapbox-gl-draw-snap-mode";
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic';
import * as MapboxDrawWaypoint from 'mapbox-gl-draw-waypoint';
import mapboxGlDrawPinningMode from "mapbox-gl-draw-pinning-mode";
import DrawEllipse from "@aquilinedrones/mapbox-gl-draw-ellipse";
import DrawAssistedRectangle from '@geostarters/mapbox-gl-draw-rectangle-assisted-mode';
import { SRMode } from 'mapbox-gl-draw-scale-rotate-mode';
import SplitLineMode from 'mapbox-gl-draw-split-line-mode';


import mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';
import CutPolygonMode from 'mapbox-gl-draw-cut-polygon-mode';
import SplitPolygonMode from 'mapbox-gl-draw-split-polygon-mode';
import {
    SimpleSelectModeBezierOverride,
    DirectModeBezierOverride,
    DrawBezierCurve,
} from 'mapbox-gl-draw-bezier-curve-mode';
import { DrawArrow, DrawBezierArrow } from "./draw_arrow";
import { DrawCircle } from "./draw_circle";
import { DrawRectangle } from "./draw_rectangle";
import { DrawSector } from "./draw_sector";
import { DrawTriangle } from "./draw_triangle";

// 捕捉模式和线性信息编辑功能补丁
const NameLineSnapPatchMode = {}
Object.assign(NameLineSnapPatchMode, DrawNamedLineMode, SnapLineMode, {
    onSetup(opts: any) {
        let state = SnapLineMode.onSetup.call(this, opts)
        const isNameRequired = DrawNamedLineMode.isNameRequired === true;
        const featureName = opts.featureName;
        const showNamePrompt = (opts.showNamePrompt !== void 0 ? opts.showNamePrompt === true : (this as any).showNamePrompt === true) || (isNameRequired && !featureName);
        const extendedState = Object.assign(state, {
            isNameRequired: isNameRequired,
            name: featureName
        });
        if (showNamePrompt) {
            DrawNamedLineMode.setupNameFormControl.call(this, extendedState);
            (this as any).updateUIClasses({ mouse: 'move' });
            (this as any)._ctx.ui.updateMapClasses();
        }

        return extendedState
    },
    onStop(state: any) {
        SnapLineMode.onStop.call(this, state);
        if (state.name) {
            (this as any)._ctx.store.setFeatureProperty(state.line.id, 'name', state.name);
        }
        DrawNamedLineMode.removeNameFormControl.call(this);

    },
    onMouseMove(state: any, e: any) {
        SnapLineMode.onMouseMove.call(this, state, e);
        if (state.line.coordinates.length > 1) {
            (this as any).map.fire('drawlinestring.mousemove', {
                feature: state.line,
                state: state
            });
        }
    }
})

// 绘图前提示输入名称 : 用户在开始绘制要素之前输入名称，或者至少允许他们选择在开始绘制之前输入名称
DrawNamedLineMode.isNameRequired = true


// 扩展跟更多功能
const { draw_point, draw_line_string, draw_polygon } = MapboxDraw.modes as any
// 扩展 draw_line_string、 draw_polygon、draw_circle、draw_point、 simple_select、 direct_select、static 基础功能的优化
let modes = MapboxDrawGeodesic.enable(MapboxDraw.modes);

modes = {
    ...modes,
    // 固定模式(重叠点同步拖动)
    pinning_mode: mapboxGlDrawPinningMode,

    // 优化新增的绘制编辑能力
    // 椭圆
    draw_ellipse: inheritSnap(DrawEllipse),
    // 矩形辅助
    draw_rectangle: inheritSnap(DrawRectangle),
    draw_assisted_rectangle: inheritSnap(DrawAssistedRectangle),
    
    // 箭头线
    draw_arrow: inheritSnap(DrawArrow),
    draw_bezier_arrow: inheritSnap(DrawBezierArrow),

    // 圆
    draw_circle: inheritSnap(DrawCircle),

    // 扇形
    draw_sector: inheritSnap(DrawSector),

    // 三角形
    draw_triangle: inheritSnap(DrawTriangle), 

    // 完善后的点线面(确保捕捉模式和其他功能兼容)
    // draw_point: SnapPointMode,
    // draw_polygon: SnapPolygonMode,
    // draw_line_string: NameLineSnapPatchMode,
    draw_point: inheritSnap(draw_point),
    draw_polygon: inheritSnap(draw_polygon),
    draw_line_string: inheritSnap(NameLineSnapPatchMode),
  
    // 旋转功能
    scaleRotateMode: SRMode,

    // 剪切功能
    splitLineMode: SplitLineMode,
    cutPolygonMode: CutPolygonMode,
    splitPolygonMode: SplitPolygonMode,
    passing_mode_point: mapboxGlDrawPassingMode(draw_point),
    passing_mode_line_string: mapboxGlDrawPassingMode(draw_line_string),
    passing_mode_polygon: mapboxGlDrawPassingMode(draw_polygon),
    

    // 贝塞尔曲线绘制
    draw_bezier_curve: inheritSnap(DrawBezierCurve),
    simple_select: SimpleSelectModeBezierOverride,
    direct_select: DirectModeBezierOverride,
}

// 扩展simple_select、 direct_select 可以直接拖动顶点无需点击顶点再拖动
modes = MapboxDrawWaypoint.enable(modes, () => false);

export default modes