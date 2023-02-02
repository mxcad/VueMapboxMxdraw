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
import { geo_distance } from '../lib/geo_distance';
import { create_geo_json_circle } from './lib/create_geo_json_circle';

interface DrawCircleState {
    currentVertexPosition: number; 
    circle: any;
}
export const DrawCircle = {
    onSetup(this:any) {
        let circle = this.newFeature({
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.CIRCLE },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });
        this.addFeature(circle);
    
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.CIRCLE);
        // 以前的 actionable 方法
        this.setActionableState({
            trash: true
        });
        return {
            circle,
            currentVertexPosition: 0
        };
    },
    onMouseMove(this:any,state: DrawCircleState, e: any) {
        let { currentVertexPosition, circle } = state;
        if (currentVertexPosition === 0) return;
        const radius = geo_distance(circle.center[1], circle.center[0], e.lngLat.lat, e.lngLat.lng);
        const coords = create_geo_json_circle(circle.center, radius);
        circle.setCoordinates([coords]);
        currentVertexPosition = coords.length;
        if (CommonSelectors.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }
        state = Object.assign(state, { currentVertexPosition, circle });
    },
    onClick(this:any,state:DrawCircleState, e:any) {
        let { circle, currentVertexPosition } = state;
        // 当前 坐标点 数量大于0时，点击直接改变modes，并返回
        if (currentVertexPosition > 0) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [circle.id] });
        }
        if (CommonSelectors.isVertex(e)) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [circle.id] });
        }
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        circle.center = [e.lngLat.lng, e.lngLat.lat];
        const coords = create_geo_json_circle([e.lngLat.lng, e.lngLat.lat], 0);
        circle.setCoordinates([coords]);
        currentVertexPosition = coords.length;
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.circle.toGeoJSON()],
        }));
        state = Object.assign(state, { currentVertexPosition, circle });
    },
    onKeyUp(this:any,state: DrawCircleState) {
        let { circle } = state;
        if (CommonSelectors.isEscapeKey) {
            this.deleteFeature(circle.id, { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT);
        }
        if (CommonSelectors.isEnterKey) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [circle.id] });
        }
    },
    onStop(this:any, state:DrawCircleState) {
        let { circle, currentVertexPosition } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        doubleClickZoom.enable(this);
        this.activateUIButton();
        if (this.getFeature(circle.id) === void 0) return;
        circle.removeCoordinate(`0.${currentVertexPosition}`);
        if (circle.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [circle.toGeoJSON()]
            });
        } else {
            this.deleteFeature([circle.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
        }
    },
    toDisplayFeatures(this:any,state:DrawCircleState, geojson:any, display:any) {
        let { circle } = state;
        const isActiveCircle = geojson.properties.id === circle.id;
        // const parentClass = circle.properties.class;
        geojson.properties.active = isActiveCircle ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
        if (!isActiveCircle) return display(geojson);
    
        if (geojson.geometry.coordinates.length === 0) return;
    
        const coordinateCount = geojson.geometry.coordinates[0].length;
    
        if (coordinateCount < 3) return;
        geojson.properties.meta = Constants.meta.FEATURE;
    
    
        // if (coordinateCount <= 4) {
        //     display(
        //         createVertex(circle.id, geojson.geometry.coordinates[0][0], '0.0', false, parentClass)
        //     );
        //     let endPos = geojson.geometry.coordinates[0].length - 3;
        //     display(
        //         createVertex(circle.id, geojson.geometry.coordinates[0][endPos], `0.${endPos}`, false, parentClass)
        //     );
        // }
    
        if (coordinateCount > 3) {
            return display(geojson);
        }
    },
    onTrash(this: any,state:DrawCircleState) {
        let { circle } = state;
        this.deleteFeature([circle.id], { silent: true });
        this.changeMode(Constants.modes.SIMPLE_SELECT);
    }
}