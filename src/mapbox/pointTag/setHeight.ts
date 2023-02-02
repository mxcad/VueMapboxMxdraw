///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////




import mapboxgl, { Anchor, LngLat, Offset, Point } from "mapbox-gl"

import { MxMapBox } from "../init"
import * as turf from "@turf/turf"


// 一下数据部分为mapbox源代码片段为方便重构提前到这里来了
export const anchorTranslate: any = {
    'center': 'translate(-50%,-50%)',
    'top': 'translate(-50%,0)',
    'top-left': 'translate(0,0)',
    'top-right': 'translate(-100%,0)',
    'bottom': 'translate(-50%,-100%)',
    'bottom-left': 'translate(0,-100%)',
    'bottom-right': 'translate(-100%,-100%)',
    'left': 'translate(0,-50%)',
    'right': 'translate(-100%,-50%)'
};
export const TERRAIN_OCCLUDED_OPACITY = 0.2;
function createDOM(tagName: string, className?:string, container?: HTMLElement): any {
    const el = window.document.createElement(tagName);
    if (className !== void 0) el.className = className;
    if (container) container.appendChild(el);
    return el;
}
// returns a normalized offset for a given anchor
function normalizeOffset(offset: Offset = new Point(0, 0), anchor: Anchor = 'bottom'): Point {
    if (typeof offset === 'number') {
        // input specifies a radius from which to calculate offsets at all positions
        const cornerOffset = Math.round(Math.sqrt(0.5 * Math.pow(offset, 2)));
        switch (anchor) {
        case 'top': return new Point(0, offset);
        case 'top-left': return new Point(cornerOffset, cornerOffset);
        case 'top-right': return new Point(-cornerOffset, cornerOffset);
        case 'bottom': return new Point(0, -offset);
        case 'bottom-left': return new Point(cornerOffset, -cornerOffset);
        case 'bottom-right': return new Point(-cornerOffset, -cornerOffset);
        case 'left': return new Point(offset, 0);
        case 'right': return new Point(-offset, 0);
        }
        return new Point(0, 0);
    }

    if (offset instanceof Point || Array.isArray(offset)) {
        // input specifies a single offset to be applied to all positions
        return Point.convert(offset);
    }

    // input specifies an offset per position
    return Point.convert(offset[anchor] || [0, 0]);
}

export function smartWrap(_lngLat: any, priorPos: Point, transform: any): LngLat {
    let lngLat = new LngLat(_lngLat.lng, _lngLat.lat) as any
   
    // First, try shifting one world in either direction, and see if either is closer to the
    // prior position. Don't shift away if it new position is further from center.
    // This preserves object constancy when the map center is auto-wrapped during animations,
    // but don't allow it to run away on horizon (points towards horizon get closer and closer).
    if (priorPos) {
        const left  = new LngLat(lngLat.lng - 360, lngLat.lat);
        const right = new LngLat(lngLat.lng + 360, lngLat.lat);
        // Unless offscreen, keep the marker within same wrap distance to center. This is to prevent
        // running it to infinity `lng` near horizon when bearing is ~90°.
        const withinWrap =  Math.ceil(Math.abs(lngLat.lng - transform.center.lng) / 360) * 360;
        const delta = transform.locationPoint(lngLat).distSqr(priorPos);
        const offscreen = priorPos.x < 0 || priorPos.y < 0 || priorPos.x > transform.width || priorPos.y > transform.height;
        if (transform.locationPoint(left).distSqr(priorPos) < delta && (offscreen || Math.abs(left.lng - transform.center.lng) < withinWrap)) {
            lngLat = left;
        } else if (transform.locationPoint(right).distSqr(priorPos) < delta && (offscreen || Math.abs(right.lng - transform.center.lng) < withinWrap)) {
            lngLat = right;
        }
    }

    // Second, wrap toward the center until the new position is on screen, or we can't get
    // any closer.
    while (Math.abs(lngLat.lng - transform.center.lng) > 180) {
        const pos = transform.locationPoint(lngLat);
        if (pos.x >= 0 && pos.y >= 0 && pos.x <= transform.width && pos.y <= transform.height) {
            break;
        }
        if (lngLat.lng > transform.center.lng) {
            lngLat.lng -= 360;
        } else {
            lngLat.lng += 360;
        }
    }
    // 赋值位置高度
    lngLat.alt = _lngLat.alt
    return lngLat;
}

export type  MyMarkerOptions = mapboxgl.MarkerOptions & {height?: number; scaleMaxZoom?: number, isAutoScale?:boolean}

// 重写Marker 类
export class MyMarker extends mapboxgl.Marker {
    _height:number | undefined;
    _scaleMaxZoom: number | undefined
    _isAutoScale: boolean | undefined
    constructor(options?: MyMarkerOptions) {
        super(options)
        if(options?.height) this.setHeight(options?.height)
        if(options?.scaleMaxZoom) this.setScaleMaxZoom(options?.scaleMaxZoom)
        if(options?.isAutoScale) this.setIsAutoScale(options?.isAutoScale)
    }

    // 强制自定缩放
    setIsAutoScale(zoom:boolean) {
        this._isAutoScale = zoom
    }

    // 用于限定标记的自定缩放
    setScaleMaxZoom(zoom:number) {
        this._scaleMaxZoom = zoom
    }
    
    // 获取高度
    getHeight() {
        return this._height || 0
    }
    // 设置高度
    setHeight(height: number) {
        const _this = this as any
        this._height = height
        if( _this._lngLat)_this._lngLat.alt = height
    }
    // 设置位置
    setLngLat(lnglat: any): this {
        const _this = this as any
        _this._lngLat = mapboxgl.LngLat.convert(lnglat);
        _this._lngLat.alt = this._height
        _this._pos = null;
        if (_this._popup) _this._popup.setLngLat(_this._lngLat);
        _this._update(true);
        return this;
    }
    _addDragHandler(e: any) {
        const _this = this as any
        const map = _this._map;
        if (!map) return;

        if (_this._element.contains((e.originalEvent.target))) {
            e.preventDefault();

            // We need to calculate the pixel distance between the click point
            // and the marker position, with the offset accounted for. Then we
            // can subtract this distance from the mousemove event's position
            // to calculate the new marker position.
            // If we don't do this, the marker 'jumps' to the click position
            // creating a jarring UX effect.
            // 新增_transformedOffset方法计算偏移
            _this._positionDelta = e.point.sub(_this._pos).add(this._transformedOffset());

            _this._pointerdownPos = e.point;

            _this._state = 'pending';
            map.on('mousemove', _this._onMove);
            map.on('touchmove', _this._onMove);
            map.once('mouseup', _this._onUp);
            map.once('touchend', _this._onUp);
        }
    }
    // 计算位置上的偏移量
    _transformedOffset(){
        const _this = this as any
        if(!_this._defaultMarker)return _this._offset;
        const t=_this._map.transform,
        e=_this._offset.mult(_this._scale);
        return "map" === _this._rotationAlignment && e._rotate(t.angle), "map"===_this._pitchAlignment && (e.x *= Math.cos(t._pitch)), e
    }
    // 在源码增加位置偏移量_transformedOffset
    _evaluateOpacity() {
        const _this = this as any
        const map = _this._map;
        if (!map) return;

        const pos = _this._pos

        if (!pos || pos.x < 0 || pos.x > map.transform.width || pos.y < 0 || pos.y > map.transform.height) {
            _this._clearFadeTimer();
            return;
        }

        const mapLocation = map.unproject(pos);

        let terrainOccluded = false;
        if (map.transform._terrainEnabled() && map.getTerrain()) {
            const camera = map.getFreeCameraOptions();
            if (camera.position) {
                const cameraPos = camera.position.toLngLat();
                // the distance to the marker lat/lng + marker offset location
                const offsetDistance = cameraPos.distanceTo(mapLocation);
                const distance = cameraPos.distanceTo(_this._lngLat);
                terrainOccluded = offsetDistance < distance * 0.9;
            }
        }

        const fogOpacity = map._queryFogOpacity(mapLocation);
        const opacity = (1.0 - fogOpacity) * (terrainOccluded ? TERRAIN_OCCLUDED_OPACITY : 1.0);
        _this._element.style.opacity = `${opacity}`;
        if (_this._popup) _this._popup._setOpacity(`${opacity}`);

        _this._fadeTimer = null;
    }
    setPopup(popup?: any): this {
        const  _this = this as any
        if (_this._popup) {
            _this._popup.remove();
            _this._popup = null;
            _this._element.removeAttribute('role');
            _this._element.removeEventListener('keypress', _this._onKeyPress);

            if (!_this._originalTabIndex) {
                _this._element.removeAttribute('tabindex');
            }
        }

        if (popup) {
            if (!('offset' in popup.options)) {
                const markerHeight = 41 - (5.8 / 2);
                const markerRadius = 13.5;
                const linearOffset = Math.sqrt(Math.pow(markerRadius, 2) / 2);
                popup.options.offset = _this._defaultMarker ? {
                    'top': [0, 0],
                    'top-left': [0, 0],
                    'top-right': [0, 0],
                    'bottom': [0, -markerHeight],
                    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
                    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
                    'left': [markerRadius, (markerHeight - markerRadius) * -1],
                    'right': [-markerRadius, (markerHeight - markerRadius) * -1]
                } : _this._offset;
            }
            _this._popup = popup;
            if (_this._lngLat) _this._popup.setLngLat(_this._lngLat);

            _this._element.setAttribute('role', 'button');
            _this._originalTabIndex = _this._element.getAttribute('tabindex');
            if (!_this._originalTabIndex) {
                _this._element.setAttribute('tabindex', '0');
            }
            _this._element.addEventListener('keypress', _this._onKeyPress);
            _this._element.setAttribute('aria-expanded', 'false');
        }

        return this;
    }
    _updateDOM() {
        const _this = this as  any
        const pos = _this._pos;
        if (!pos) { return; }
        const offset = _this._offset.mult(_this._scale);
        const pitch = _this._calculatePitch();
        const rotation  = _this._calculateRotation();
        const zoom = _this._map.getZoom()
        // 缩放比
        let ratio
        if(_this._scaleMaxZoom && zoom <= _this._scaleMaxZoom || (_this._scaleMaxZoom && _this._isAutoScale)) {
            ratio = Math.pow(2, zoom - _this._scaleMaxZoom);
        }

        _this._element.style.transform = `
            translate(${pos.x}px, ${pos.y}px) ${anchorTranslate[_this._anchor]}
            rotateX(${pitch}deg) rotateZ(${rotation}deg)
            translate(${offset.x}px, ${offset.y}px)
            ${ ratio ?  'scale(' + ratio + ',' + ratio +')' :'' }
        `;
    }
    _update(delaySnap?: boolean) {
        const _this = this as any
        window.cancelAnimationFrame(_this._updateFrameId);
        const map = _this._map;
        if (!map) return;
        if (map.transform.renderWorldCopies) {
            _this._lngLat = smartWrap(_this._lngLat, _this._pos, map.transform);
        }
        _this._pos = map.project(_this._lngLat).sub(_this._transformedOffset());
        // because rounding the coordinates at every `move` event causes stuttered zooming
        // we only round them when _update is called with `moveend` or when its called with
        // no arguments (when the Marker is initialized or Marker#setLngLat is invoked).
        if (delaySnap === true) {
            _this._updateFrameId = window.requestAnimationFrame(() => {
                if (_this._element && _this._pos && _this._anchor) {
                    _this._pos = _this._pos.round();
                    _this._updateDOM();
                }
            });
        } else {
            _this._pos = _this._pos.round();
        }

        map._requestDomTask(() => {
            if (!_this._map) return;

            if (_this._element && _this._pos && _this._anchor) {
                _this._updateDOM();
            }

            if ((map.getTerrain() || map.getFog()) && !_this._fadeTimer) {
                _this._fadeTimer = setTimeout(_this._evaluateOpacity.bind(this), 60);
            }
        });
    }
}


class MyPopup extends mapboxgl.Popup {
    _height:number | undefined;
    constructor(options?: MyMarkerOptions) {
        super(options)
        if(options?.height) this.setHeight(options?.height)
    }
    setHeight(height: number) {
        const _this = this as any
        this._height = height
        if( _this._lngLat)_this._lngLat.alt = height
        return this
    }
    setLngLat(lnglat:any): this {
        const _this = this as any
        _this._lngLat = LngLat.convert(lnglat);
        if(!_this._lngLat.alt) _this._lngLat.alt = _this._height
        _this._pos = null;

        _this._trackPointer = false;

        _this._update();

        const map = _this._map;
        if (map) {
            map.on('move', _this._update);
            map.off('mousemove', _this._onMouseEvent);
            map._canvasContainer.classList.remove('mapboxgl-track-pointer');
        }

        return this;
    }
    _update(cursor?: Point) {
        const _this = this as any
        const hasPosition = _this._lngLat || _this._trackPointer;
        const map = _this._map;
        const content = _this._content;

        if (!map || !hasPosition || !content) { return; }

        let container = _this._container;

        if (!container) {
            container = _this._container = createDOM('div', 'mapboxgl-popup', map.getContainer());
            _this._tip = createDOM('div', 'mapboxgl-popup-tip', container);
            container.appendChild(content);
        }

        if (_this.options.maxWidth && container.style.maxWidth !== _this.options.maxWidth) {
            container.style.maxWidth = _this.options.maxWidth;
        }

        if (map.transform.renderWorldCopies && !_this._trackPointer) {
            _this._lngLat = smartWrap(_this._lngLat, _this._pos, map.transform);
        }

        if (!_this._trackPointer || cursor) {
            const pos = _this._pos = _this._trackPointer && cursor ? cursor : map.project(_this._lngLat);

            const offsetBottom = normalizeOffset(_this.options.offset);
            const anchor = _this._anchor = _this._getAnchor(offsetBottom.y);
            const offset = normalizeOffset(_this.options.offset, anchor);

            const offsetedPos = pos.add(offset).round();
            map._requestDomTask(() => {
                if (_this._container && anchor) {
                    _this._container.style.transform = `${anchorTranslate[anchor]} translate(${offsetedPos.x}px,${offsetedPos.y}px)`;
                }
            });
        }

        _this._updateClassList();
    }
}

// 设置弹框标记点高度

export function setHeight() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const data = turf.randomPolygon(1, { bbox, num_vertices: 4, max_radial_length: 0.001 })
    data.features[0].properties = {
        height: 500
    }
    const coord = (turf.center(data) as any).geometry.coordinates
    
    map.addLayer({
        'id': '3d-setHeight',
        'source': {
            "type": "geojson",
            data
        },
        'type': 'fill-extrusion',
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],       
            'fill-extrusion-opacity': .6
        }
    });
    const mrk = new MyMarker({
        height: data.features[0].properties.height,
        scaleMaxZoom: 12, // 最大缩放 当zoom大于12时，则标签保持原样 小于则自动缩放
    }).setLngLat(coord).addTo(map).setPopup(new MyPopup().setHTML('456'))

    new MyPopup().setHTML('123').setLngLat(coord).setHeight(300).addTo(map)
}