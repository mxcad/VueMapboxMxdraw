

import * as CommonSelector from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import createVertex from '@mapbox/mapbox-gl-draw/src/lib/create_vertex';
import isEventAtCoordinates from '@mapbox/mapbox-gl-draw/src/lib/is_event_at_coordinates';


interface DrawTriangleState { triangle: any; currentVertexPosition: number; }
Constants.geojsonTypes.TRIANGLE = 'Triangle';
Constants.types.TRIANGLE = 'triangle';
Constants.cursors.NONE = 'none';
export const DrawTriangle  = {
    onSetup(this:any) {
        const triangle = this.newFeature({
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.TRIANGLE },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });
    
        this.addFeature(triangle);
    
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.TRIANGLE);
    
        this.setActionableState({ trash: true });
    
        return {
            triangle,
            currentVertexPosition: 0
        };
    },
    clickAnywhere(this:any,state:DrawTriangleState, e:any) {
        let { triangle, currentVertexPosition } = state;
        if (currentVertexPosition > 0 && isEventAtCoordinates(e, triangle.coordinates[0][currentVertexPosition - 1])) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [triangle.id] });
        }
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        triangle.updateCoordinate(`0.${currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
        currentVertexPosition++;
        triangle.updateCoordinate(`0.${currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
        state = Object.assign(state, { triangle, currentVertexPosition });
        // 当 点数为3时，结束绘制
        if (currentVertexPosition >= 3) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [triangle.id] });
        }
    },
    clickOnVertex(this:any,state:DrawTriangleState) {
        let { triangle } = state;
        return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [triangle.id] });
    },
    onTap(this:any,state:DrawTriangleState, e:any) {
        if (CommonSelector.isVertex(e)) return this.clickOnVertex(state, e);
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.triangle.toGeoJSON()],
        }));
        return this.clickAnywhere(state, e);
    },
    onClick(this:any,state:DrawTriangleState, e:any) {
        if (CommonSelector.isVertex(e)) return this.clickOnVertex(state, e);
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.triangle.toGeoJSON()],
        }));
        return this.clickAnywhere(state, e);
    },
    onKeyUp(this:any,state:DrawTriangleState, e:any) {
        let { triangle } = state;
        if (CommonSelector.isEscapeKey(e)) {
            this.deleteFeature([triangle.id], { slient: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT);
        } else if (CommonSelector.isEnterKey(e)) {
            this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [triangle.id] });
        }
    },
    onMouseMove(this:any,state:DrawTriangleState, e:any) {
        let { triangle, currentVertexPosition } = state;
        triangle.updateCoordinate(`0.${currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
        if (CommonSelector.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }
    },
    onStop(this:any,state: DrawTriangleState) {
        let { triangle, currentVertexPosition } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        doubleClickZoom.enable(this);
        this.activateUIButton();
        if (this.getFeature(triangle.id) === undefined) return;
        triangle.removeCoordinate(`0.${currentVertexPosition}`);
    
        if (triangle.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [triangle.toGeoJSON()]
            });
        } else {
            this.deleteFeature([triangle.id], { slient: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { slient: true });
        }
    },
    toDisplayFeatures(this:any, state: DrawTriangleState, geojson: any, display:Function) {
        let { triangle } = state;
        const isActiveTriangle = geojson.properties.id === triangle.id;
        geojson.properties.active = isActiveTriangle ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
        if (!isActiveTriangle) return display(geojson);
        // Don't render a polygon until it has two positions
        // (and a 3rd which is just the first repeated)
  
        if (geojson.geometry.coordinates.length === 0) return;
    
        // 2 coordinates after selecting a draw type
        // 3 after creating the first point
        const coordinateCount = geojson.geometry.coordinates[0].length;
      
        if (coordinateCount < 3) return;
    
        geojson.properties.meta = Constants.meta.FEATURE;
        display(
            createVertex(triangle.id, geojson.geometry.coordinates[0][0], '0.0', false)
        );
        if (coordinateCount > 3) {
            const endPos = geojson.geometry.coordinates[0].length - 3;
            display(
                createVertex(triangle.id, geojson.geometry.coordinates[0][endPos], `0.${endPos}`, false)
            );
        }
        if (coordinateCount <= 4) {
            // If we've only drawn two positions (plus the closer),
            // make a LineString instead of a Polygon
            const lineCoordinates = [
                [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]],
                [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]
            ];
            // create an initial vertex so that we can track the first point on mobile devices
            display({
                type: Constants.geojsonTypes.FEATURE,
                properties: geojson.properties,
                geometry: {
                    coordinates: lineCoordinates,
                    type: Constants.geojsonTypes.LINE_STRING
                }
            });
            if (coordinateCount === 3) return;
        }
        return display(geojson);
    },
    onTrash(this:any,state:DrawTriangleState) {
        let { triangle } = state;
        this.deleteFeature([triangle.id], { slient: true });
        this.changeMode(Constants.modes.SIMPLE_SELECT);
    }
    
}