
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

declare module '@wabson/mapbox-gl-feature-info' 

declare module '@aquilinedrones/mapbox-gl-draw-ellipse'


declare module 'mapbox-gl-draw-pinning-mode'

declare module 'mapbox-gl-draw-snap-mode'

declare module '@map.ir/mapbox-gl-draw-geospatial-tools'

declare module 'mapbox-gl-draw-additional-tools'

declare module 'mapbox-gl-draw-scale-rotate-mode'

declare module 'mapbox-gl-draw-geodesic'

declare module 'mapbox-gl-draw-waypoint'

declare module 'mapbox-gl-draw-split-line-mode';
declare module 'mapbox-gl-draw-passing-mode';


declare module 'mapbox-gl-draw-bezier-curve-mode';

declare module  'mapbox-gl-draw-cut-polygon-mode'
declare module 'mapbox-gl-draw-split-polygon-mode'
declare module  '@geostarters/mapbox-gl-draw-rectangle-assisted-mode'
declare module '@mapbox/mapbox-gl-draw/src/lib/theme'
declare module 'mapbox-gl-draw-circle'

declare module 'mapbox-gl-draw-additional-tools'

declare module '@mapbox/mapbox-gl-draw/src/constants'

declare module '@mapbox/mapbox-gl-draw/src/lib/common_selectors'
declare module '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom'
declare module '@mapbox/mapbox-gl-draw/src/lib/create_vertex'
declare module '@mapbox/mapbox-gl-draw/src/feature_types/feature'
declare module '@mapbox/mapbox-gl-draw/src/lib/is_event_at_coordinates'
declare module 'bezier'

declare module '@dijiang/front_mapbox_custom_draw' {
    export default class MapboxDrawer {
        _map: mapboxgl.Map;
        _draw: MapboxGlDraw;
        _option?: any;
        currentSelectId: string | null;
        selectCbFn: Function;
        drawTypes: {
            [prop: string]: any;
        };
        measure_result_type: string;
        static getStyles():any
        static setStyles(style:any):any
        private _Measure;
        private _baseDraw;
        private _drawCircle;
        private _drawEllipse;
        private _drawCurve;
        private _drawRectangle;
        private _drawSector;
        private _drawCloseCurve;
        private _drawDoublearrow;
        private _drawTailsquadarrow;
        private _drawText;
        private _drawFreeLine;
        private _drawStraightArrow;
        constructor(map: mapboxgl.Map, option?: {});
        init(): void;
        switchDrawTool(tool?: string, option?: {}): Promise<unknown>;
        trash(): void;
        deleteAll(): void;
        getAll(): import("geojson").FeatureCollection<import("geojson").Geometry, import("geojson").GeoJsonProperties>;
        private defaultStyle;
        /**
         *
         * @param {string} type
         */
        private getStyleTemplate;
        setDefaultStyle(type: string, styles: {
            [props: string]: number | string;
        }): void;
        setDefaultMeasureTextStyle({ textSize, textOffset, textColor, textHaloBlur, textHaloWidth, textHaloColor }: {
            textSize: number;
            textOffset: number[];
            textColor: string;
            textHaloBlur: number;
            textHaloWidth: number;
            textHaloColor: string;
        }): void;
        selectStyleCB(cb: Function): void;
        private selectCb;
        deleteStyleCB(cb: any): void;
        changeStyle(name: string, value: string | number): void;
        delete(ids: string | string[]): void;
        getSelectedIds(): string[];
        selectCB(cb: (f: any) => void): void;
        updateCB(cb: (f: any) => void): void;
        deleteCB(cb: (f: any) => void): void;
    }
}
declare namespace MapboxDraw {
    
    interface DrawModes {
        DRAW_LINE_STRING: 'draw_line_string'
        DRAW_POLYGON: 'draw_polygon'
        DRAW_POINT: 'draw_point'
        SIMPLE_SELECT: 'simple_select'
        DIRECT_SELECT: 'direct_select'
        STATIC: 'static'
        pinning_mode: 'pinning_mode'
        draw_ellipse: 'draw_ellipse'
        draw_circle: 'draw_circle'
        draw_line_string_snap: 'draw_line_string_snap'
        splitLineMode: 'splitLineMode'
        draw_bezier_curve: 'draw_bezier_curve'
        cutPolygonMode: 'cutPolygonMode'
        draw_assisted_rectangle: 'draw_assisted_rectangle'
        draw_arrow: 'draw_arrow'
        draw_bezier_arrow: 'draw_bezier_arrow'
        draw_circle: 'draw_circle'
        draw_rectangle: 'draw_rectangle'
        draw_sector: 'draw_sector'
        draw_triangle: 'draw_triangle'
    }
}
declare class MapboxDraw implements IControl {
    options: {
        // 捕捉点
        snap: boolean;
        // 捕捉网格
        guides: boolean
    }
    changeMode(mode: 'splitLineMode', options?: { spliter: string }): this;
}