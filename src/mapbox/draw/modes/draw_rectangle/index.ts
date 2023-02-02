///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import * as CommonSelector from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import { create_geo_json_rectangle } from './lib/create_geo_json_rectangle';
import createVertex from '@mapbox/mapbox-gl-draw/src/lib/create_vertex';
Constants.geojsonTypes.TRIANGLE = 'Triangle';
Constants.types.RECTANGLE  = 'rectangle'

interface DrawRectangleState { 
    rectangle: any; 
    currentVertexPosition: number; 
}
export const DrawRectangle = {
    onSetup(this:any) {
        let rectangle = this.newFeature({
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.RECTANGLE },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });
    
        this.addFeature(rectangle);
    
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.RECTANGLE);
    
        this.setActionableState({ trash: true });
        return {
            rectangle,
            currentVertexPosition: 0
        };
    },
    onClick(this:any,state: DrawRectangleState, e: { lngLat: any }) {
        let { rectangle, currentVertexPosition } = state;
        if (currentVertexPosition > 0) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [rectangle.id] });
        }
        if (CommonSelector.isVertex(e)) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [rectangle.id] });
        }
    
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        rectangle.onePoint = [e.lngLat.lng, e.lngLat.lat];
        const coords = create_geo_json_rectangle(rectangle.onePoint, rectangle.onePoint);
        rectangle.setCoordinates([coords]);
        currentVertexPosition = coords.length;
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.rectangle.toGeoJSON()],
        }));
        state = Object.assign(state, { rectangle, currentVertexPosition });
    },
    onMouseMove(this:any, state:DrawRectangleState, e:any) {
        let { rectangle, currentVertexPosition } = state;
        if (currentVertexPosition === 0) return;
        //right-top-point
        const threePoint = [e.lngLat.lng, e.lngLat.lat];
        rectangle.threePoint = threePoint;
        const coords = create_geo_json_rectangle(rectangle.onePoint, threePoint);
        rectangle.setCoordinates([coords]);
        currentVertexPosition = coords.length;
        if (CommonSelector.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }
        state = Object.assign(state, { currentVertexPosition, rectangle });
    },
    onStop(this:any ,state: DrawRectangleState) {
        let { rectangle, currentVertexPosition } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        doubleClickZoom.enable(this);
        this.activateUIButton();
        if (this.getFeature(rectangle.id) === void 0) return;
        rectangle.removeCoordinate(`0.${currentVertexPosition}`);
        if (rectangle.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [rectangle.toGeoJSON()]
            });
        } else {
            this.deleteFeature([rectangle.id], { silent: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
        }
    },
    toDisplayFeatures(this:any,state:DrawRectangleState, geojson:any, display:Function) {
        let { rectangle } = state;
        const isActiveRectangle = geojson.properties.id === rectangle.id;
        // const parentClass = rectangle.properties.class;
        geojson.properties.active = isActiveRectangle ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
    
        if (!isActiveRectangle) return display(geojson);
        if (geojson.geometry.coordinates.length === 0) return;
        const coordinateCount = geojson.geometry.coordinates[0].length;
        if (coordinateCount < 4) return;
    
        geojson.properties.meta = Constants.meta.FEATURE;
        display(createVertex(rectangle.id, geojson.geometry.coordinates[0][0], '0.0', false));
        // if (coordinateCount > 5) {
        //     const endPos = geojson.geometry.coordinates[0].length - 4;
        //     display(
        //         createVertex(rectangle.id, geojson.geometry.coordinates[0][endPos], `0.${endPos}`, false)
        //     );
        // }
    
        return display(geojson);
    }
}