
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
import createVertex from '@mapbox/mapbox-gl-draw/src/lib/create_vertex';
import  Feature from '@mapbox/mapbox-gl-draw/src/feature_types/feature'
import * as turf from "@turf/turf"

class Sector extends Feature {
    constructor(ctx:any, geojson:any) {
        super(ctx, geojson);
        this.coordinates = this.coordinates.map((ring: string | any[]) => ring.slice(0, -1));
    }
    isValid() {
        if (this.coordinates.length === 0) return false;
        return this.coordinates.every((ring: string | any[]) => ring.length > 2);
    }
    // 需要有效的geoJSON多边形几何:第一个和最后一个位置必须相等。
    incomingCoords(coords: any[]) {
        this.coordinates = coords.map((ring: string | any[]) => ring.slice(0, -1));
        this.changed();
    }
    // 不是有效的geoJSON多边形几何:第一个和最后一个位置必须不相等。
    setCoordinates(coords: any) {
        this.coordinates = coords;
        this.changed();
    }
    addCoordinate(path: string, lng: any, lat: any) {
        this.changed();
        const ids = path.split('.').map((x: string) => parseInt(x, 10));

        const ring = this.coordinates[ids[0]];

        ring.splice(ids[1], 0, [lng, lat]);
    }
    removeCoordinate(path: string) {
        this.changed();
        const ids = path.split('.').map((x: string) => parseInt(x, 10));
        const ring = this.coordinates[ids[0]];
        if (ring) {
            ring.splice(ids[1], 1);
            if (ring.length < 3) {
                this.coordinates.splice(ids[0], 1);
            }
        }
    }
    getCoordinate(path: string) {
        const ids = path.split('.').map((x: string) => parseInt(x, 10));
        const ring = this.coordinates[ids[0]];
        return JSON.parse(JSON.stringify(ring[ids[1]]));
    }
    getCoordinates() {
        return this.coordinates.map((coords: any[]) => coords.concat([coords[0]]));
    }
    updateCoordinate(path: string, lng: any, lat: any) {
        this.changed();
        const parts = path.split('.');
        const ringId = parseInt(parts[0], 10);
        const coordId = parseInt(parts[1], 10);
        if (coordId === 0) {
            this.center = [lng, lat];
            this.coordinates[ringId][coordId] = this.center;
        } else if (coordId === 1) {
            this.start = [lng, lat];
            this.coordinates[ringId][coordId] = this.start;
        } else if (coordId === 2) {
            let start = this.center;
            let end = this.start;
            let pos = [lng, lat];
            this.pos = pos;
            let bearing1 = turf.bearing(start, end);
            let bearing2 = turf.bearing(start, pos);
            let radius = turf.distance(start, end);

            const sector = turf.sector(start, radius, bearing1, bearing2).geometry.coordinates[0].slice(0, -1);
            this.coordinates = [sector];
        }

        if (this.coordinates[ringId] === undefined) {
            this.coordinates[ringId] = [];
        }
    }
}


interface DrawSectorState { sector: any; currentVertexPosition: number; }
export const DrawSector = {
    onSetup(this: any) {
        let sector = new Sector(this._ctx, {
            type: Constants.geojsonTypes.FEATURE,
            properties: { '_type_': Constants.geojsonTypes.SECTOR },
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [[]]
            }
        });

        this.addFeature(sector);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        this.activateUIButton(Constants.types.SECTOR);
        this.setActionableState({ trash: true });

        return {
            sector,
            currentVertexPosition: 0
        };
    },

    onClick(this: any, state: DrawSectorState, e: any) {
        let { sector, currentVertexPosition } = state;
        if (currentVertexPosition > 1) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [sector.id] });
        }
        if (CommonSelectors.isVertex(e)) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [sector.id] });
        }
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
        sector.updateCoordinate('0.' + currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
        currentVertexPosition++;
        this.map.fire(Constants.events.CLICK, Object.assign(e, {
            features: [state.sector.toGeoJSON()],
        }));
        state = Object.assign(state, { currentVertexPosition, sector });
    },
    onMouseMove(this: any, state: DrawSectorState, e: any) {
        let { sector, currentVertexPosition } = state;
        // let { center, arcPoint, radius } = sector;
        if (currentVertexPosition === 0) return;

        sector.updateCoordinate('0.' + currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
        if (CommonSelectors.isVertex(e)) {
            this.updateUIClasses({ mouse: Constants.cursors.POINTER });
        }
        state = Object.assign(state, { sector, currentVertexPosition });
    },
    onStop(this: any, state: DrawSectorState) {
        let { sector, currentVertexPosition } = state;
        this.updateUIClasses({ mouse: Constants.cursors.NONE });
        doubleClickZoom.enable(this);
        this.activateUIButton();

        if (this.getFeature(sector.id) === undefined) return;
        sector.removeCoordinate(`0.${currentVertexPosition}`);
        if (sector.isValid()) {
            this.map.fire(Constants.events.CREATE, {
                features: [sector.toGeoJSON()]
            });
        } else {
            this.deleteFeature([sector.id], { slient: true });
            this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { slient: true });
        }
    },
    toDisplayFeatures(this: any, state: DrawSectorState, geojson: any, display: Function) {
        let { sector, currentVertexPosition } = state;
        const isActiveSector = geojson.properties.id === sector.id;
        // const parentClass = sector.properties.class;
        geojson.properties.active = isActiveSector ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
        if (!isActiveSector) return display(geojson);

        if (geojson.geometry.coordinates.length === 0) return;

        const coordinateCount = geojson.geometry.coordinates[0].length;
        if (coordinateCount < 3) return;

        geojson.properties.meta = Constants.meta.FEATURE;
        display(createVertex(sector.id, geojson.geometry.coordinates[0][0], '0.0', false));
        if (coordinateCount > 4) {
            const len = geojson.geometry.coordinates[0].length - 1;
            display(createVertex(sector.id, geojson.geometry.coordinates[0][len], '0.' + len, false));
        }

        if (currentVertexPosition === 2) {
            display(createVertex(sector.id, geojson.geometry.coordinates[0][1], '0.1', false));
        }

        if (coordinateCount <= 4) {
            const lineCoordinates = [
                [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]],
                [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]
            ];
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
        // geojson.properties.meta = Constants.meta.FEATURE;
        return display(geojson);
    },
    onTrash(this: any, state: DrawSectorState) {
        let { sector } = state;
        this.deleteFeature([sector.id], { silent: true });
        this.changeMode(Constants.modes.SIMPLE_SELECT);
    }



}