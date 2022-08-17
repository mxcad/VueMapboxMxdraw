
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

// 选择缩放操作点的样式
export default [

    {
        id: 'gl-draw-line-rotate-point',
        type: 'line',
        filter: [
            'all',
            ['==', 'meta', 'midpoint'],
            ['==', 'icon', 'rotate'],
            ['==', '$type', 'LineString'],
            ['!=', 'mode', 'static'],
        ],
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': '#fbb03b',
            'line-dasharray': [0.2, 2],
            'line-width': 2,
        },
    },
    {
        id: 'gl-draw-polygon-rotate-point-stroke',
        type: 'circle',
        filter: [
            'all',
            ['==', 'meta', 'midpoint'],
            ['==', 'icon', 'rotate'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
        ],
        paint: {
            'circle-radius': 4,
            'circle-color': '#fff',
        },
    },
    {
        id: 'gl-draw-polygon-rotate-point',
        type: 'circle',
        filter: [
            'all',
            ['==', 'meta', 'midpoint'],
            ['==', 'icon', 'rotate'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
        ],
        paint: {
            'circle-radius': 2,
            'circle-color': '#fbb03b',
        },
    },
    {
        id: 'gl-draw-polygon-rotate-point-icon',
        type: 'symbol',
        filter: [
            'all',
            ['==', 'meta', 'midpoint'],
            ['==', 'icon', 'rotate'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
        ],
        layout: {
            'icon-image': 'rotate',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-rotation-alignment': 'map',
            'icon-rotate': ['get', 'heading'],
        },
        paint: {
            'icon-opacity': 1.0,
            'icon-opacity-transition': {
                delay: 0,
                duration: 0,
            },
        },
    },
    {
        id: 'gl-draw-polygon-and-line-vertex-scale-icon',
        type: 'symbol',
        filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
            ['has', 'heading'],
        ],
        layout: {
            'icon-image': 'scale',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-rotation-alignment': 'map',
            'icon-rotate': ['get', 'heading'],
        },
        paint: {
            'icon-opacity': 1.0,
            'icon-opacity-transition': {
                delay: 0,
                duration: 0,
            },
        },
    },


]