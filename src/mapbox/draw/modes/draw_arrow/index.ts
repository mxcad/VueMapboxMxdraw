///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import * as CommonSelectors from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import { getArrowVertex } from './lib/getArrowVertex';
import { get_bezier_arrow_vertex } from './lib/get_bezier_arrow_vertex';

// 新增点击事件
Constants.events.CLICK = 'draw.click'

let center = {
    x: 0,
    y: 0
};
interface DrawArrowStateType {
    arrow: any
    currentClickNum: number
}
// 常规实体箭头
export const DrawArrow = {
    onSetup(this: any): DrawArrowStateType {
        // 创建一个新的箭头数据
        const arrow = this.newFeature({
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.ARROW },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });
        // 添加数据
        this.addFeature(arrow);
        // 取消选择的图形
        this.clearSelectedFeatures();
        // 禁止双击放大
        doubleClickZoom.disable(this);
        // 更新鼠标样式
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.ARROW);

        this.setActionableState({ trash: true });
        return {
            arrow,
            currentClickNum: 0
        };
    },
    onMouseMove(this: any, state: DrawArrowStateType, e: any) {
        let { arrow, currentClickNum } = state;
        if (currentClickNum === 1) {
            const arrowVertex = getArrowVertex(this, center, this.map.project(e.lngLat));
            if (arrowVertex) {
                arrow.setCoordinates([arrowVertex]);
            }
        } else if (currentClickNum === 2) {
            this.map.fire(Constants.events.CREATE, {
                features: [arrow.toGeoJSON()]
            });
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [arrow.id] });
        }
        if (CommonSelectors.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }
        state = Object.assign(state, { currentClickNum, arrow });
    },
    onClick(this: any, state: DrawArrowStateType, e: any) {
        let { arrow, currentClickNum } = state;
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        if (currentClickNum === 0) {
            center = this.map.project(e.lngLat);
            currentClickNum++;
        } else if (currentClickNum === 1) {
            currentClickNum++;
        }
        if (CommonSelectors.isVertex(e)) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [arrow.id] });
        }
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.arrow.toGeoJSON()],
        }));
        state = Object.assign(state, { currentClickNum, arrow });
    },
    onKeyUp(this: any, state: DrawArrowStateType) {
        let { arrow } = state;
        if (CommonSelectors.isEscapeKey) {
            this.deleteFeature([arrow.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT);
        }
        if (CommonSelectors.isEnterKey) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [arrow.id] });
        }
    },
    onStop(this: any, state: DrawArrowStateType) {
        let { arrow } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        const initialDoubleClickZoomState = this.map ? this.map.doubleClickZoom.isEnabled() : true;
        if (initialDoubleClickZoomState) {
            doubleClickZoom.enable(this);
        }
        this.activateUIButton();

        if (this.getFeature(arrow.id) === void 0) return;

        if (arrow.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [arrow.toGeoJSON()]
            });
        } else {
            this.deleteFeature([arrow.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
        }
    },
    toDisplayFeatures(this: any, state: DrawArrowStateType, geojson: any, display: Function) {
        let { arrow } = state;
        const isActivePolygon = geojson.properties.id === arrow.id;
        geojson.properties.active = isActivePolygon ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
        if (!isActivePolygon) return display(geojson);

        if (geojson.geometry.coordinates.length === 0) return;

        const coordinateCount = geojson.geometry.coordinates[0].length;
        if (coordinateCount < 3) return;
        geojson.properties.meta = Constants.meta.FEATURE;
        if (coordinateCount > 3) {
            return display(geojson);
        }

        // If we've only drawn two positions (plus the closer),
        // make a LineString instead of a Polygon
        const lineCoordinates = [
            [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]], [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]
        ];
        return display({
            type: Constants.geojsonTypes.FEATURE,
            properties: geojson.properties,
            geometry: {
                coordinates: lineCoordinates,
                type: Constants.geojsonTypes.LINE_STRING
            }
        });
    },
    onTrash(this: any, state: DrawArrowStateType) {
        let { arrow } = state;
        this.deleteFeature([arrow.id], { silent: true });
        this.changeMode(Constants.modes.SIMPLE_SELECT);
    }
};

// 贝塞尔bezier曲线箭头
let points: any[] = [];
interface DrawBezierArrowStateType {
    bezierArrow: any
    currentClickNum: number
}
export const DrawBezierArrow = {
    onSetup(this: any) {
        const bezierArrow = this.newFeature({
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.BEZIERARROW },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });
        this.addFeature(bezierArrow);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.BEZIERARROW);

        this.setActionableState({ trash: true });
        return {
            bezierArrow,
            currentClickNum: 0
        };
    },
    onMouseMove(this: any, state: DrawBezierArrowStateType, e: any) {
        let { bezierArrow, currentClickNum } = state;
        if (currentClickNum === 1) {
            const arrowVertex = get_bezier_arrow_vertex(this, points[0], this.map.project(e.lngLat));
            if (arrowVertex) {
                bezierArrow.setCoordinates([arrowVertex]);
            }
        } else if (currentClickNum === 2) {
            const arrowVertex = get_bezier_arrow_vertex(this, points[0], points[1], this.map.project(e.lngLat));
            if (arrowVertex) {
                bezierArrow.setCoordinates([arrowVertex]);
            }
        } else if (currentClickNum === 3) {
            this.map.fire(Constants.events.CREATE, {
                features: [bezierArrow.toGeoJSON()]
            });
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [bezierArrow.id] });
        }

        if (CommonSelectors.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }

        state = Object.assign(state, { currentClickNum, bezierArrow });
    },
    onClick(this: any, state: DrawBezierArrowStateType, e: any) {
        let { bezierArrow, currentClickNum } = state;
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        if (currentClickNum < 2) {
            points.push(this.map.project(e.lngLat));
            currentClickNum++;
        } else if (currentClickNum === 2) {
            currentClickNum++;
        }

        if (CommonSelectors.isVertex(e)) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [bezierArrow.id] });
        }
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.bezierArrow.toGeoJSON()],
        }));
        state = Object.assign(state, { currentClickNum, bezierArrow });
    },
    onKeyUp(this: any, state: DrawBezierArrowStateType) {
        let { bezierArrow } = state;
        if (CommonSelectors.isEscapeKey) {
            this.deleteFeature([bezierArrow.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT);
        }
        if (CommonSelectors.isEnterKey) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [bezierArrow.id] });
        }
    },
    onStop(this:any, state: DrawBezierArrowStateType) {
        let { bezierArrow } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        const initialDoubleClickZoomState = this.map ? this.map.doubleClickZoom.isEnabled() : true;
        if (initialDoubleClickZoomState) doubleClickZoom.enable(this);
    
        this.activateUIButton();
    
        if (this.getFeature(bezierArrow.id) === void 0) return;
    
        if (bezierArrow.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [bezierArrow.toGeoJSON()]
            });
        } else {
            this.deleteFeature([bezierArrow.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
        }
        points = [];
    },
    toDisplayFeatures(this:any, state:DrawBezierArrowStateType, geojson:any, display:Function) {
        let { bezierArrow } = state;
        const isActivePolygon = geojson.properties.id === bezierArrow.id;
        geojson.properties.active = isActivePolygon ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
        if (!isActivePolygon) return display(geojson);
    
        if (geojson.geometry.coordinates.length === 0) return;
        const coordinateCount = geojson.geometry.coordinates[0].length;
        if (coordinateCount < 3) return;
        geojson.properties.meta = Constants.meta.FEATURE;
        if (coordinateCount > 3) {
            return display(geojson);
        }
    
        const lineCoordinates = [
            [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]], [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]
        ];
        return display({
            type: Constants.geojsonTypes.FEATURE,
            properties: geojson.properties,
            geometry: {
                coordinates: lineCoordinates,
                type: Constants.geojsonTypes.LINE_STRING
            }
        });
    },
    onTrash(this: any, state:DrawBezierArrowStateType) {
        let { bezierArrow } = state;
        this.deleteFeature([bezierArrow.id], { silent: true });
        this.changeMode(Constants.modes.SIMPLE_SELECT);
    }
}
