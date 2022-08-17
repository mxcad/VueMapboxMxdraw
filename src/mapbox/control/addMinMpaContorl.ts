///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import mapboxgl from "mapbox-gl";
// 扩展mapboxgl 提供小地图的功能
const win = window as any
win.mapboxgl = mapboxgl
require("@aesqe/mapboxgl-minimap");
(mapboxgl as any).Minimap.prototype.onRemove = function() {
		this._miniMap.remove()
}

import { MxMapBox  } from "../init";
import { loadThirdPartyMaps } from "../plugins";

// 加载鹰眼小地图
export function addMinMpaContorl(map?: mapboxgl.Map) {
	if(!map) map = MxMapBox.getMap();
	// 加载天地图影像地图
    loadThirdPartyMaps.tdtyx()

	// 创建小地图
    const minMap = new (mapboxgl as any).Minimap({
        center: map.getCenter(),
        zoom: map.getZoom(),
        width: "320px",
		height: "180px",
		style: map.getStyle(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
		zoomAdjust: null,
		zoomLevels: [
            [18, 14, 16],
			[16, 12, 14],
			[14, 10, 12],
			[12, 8, 10],
			[10, 6, 8],
            [8, 4, 6],
            [6, 2, 4],
            [4, 1, 2],
            [2, 1, 1],
            [1, 1, 1]
		],

        lineColor: "#08F",
		lineWidth: 1,
		lineOpacity: 1,

		fillColor: "#F80",
		fillOpacity: 0.25,
        dragPan: true,
		scrollZoom: true,
		boxZoom: true,
		dragRotate: true,
		keyboard: true,
		doubleClickZoom: true,
		touchZoomRotate: true
    })
    map.addControl(minMap, 'bottom-right'); 
    
}