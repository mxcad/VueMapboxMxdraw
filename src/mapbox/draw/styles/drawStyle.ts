///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////  
  
  // 文字字体格式
let textFont = ['arial-unicode-ms-regular'],
  textSize = 16,
  textColor = "#000",
  userTextFont = ['get', 'user__text_font'],
  
  // 基本样式
  color = ['get', 'user__color'],
  opacity = ['get', 'user__opacity'],
  size = ['get', 'user__size'],
  width = ['get', 'user__width'],
  text = '{user__text}',
  radius = ['get', 'user__radius'],

  /**
   * polygon
  */
  // polygon 颜色值 
  baseFillInactiveColor = '#3bb2d0',
  baseFillActiveColor = '#fbb03b',
  // polygon 线框颜色值 
  baseFillOutlineInactiveColor = '#3bb2d0',
  baseFillOutlineActiveColor = '#fbb03b',
  // polygon Stroke 描边线颜色
  baseFillStrokeInactiveColor = "#3bb2d0",
  baseFillStrokeActiveColor = '#fbb03b',
  baseFillStrokeInactiveWidth = 3,
  baseFillStrokeActiveWidth = 2,
  /**
   * midpoint 中间点
   * */
  // 中间点默认颜色颜色
  midpointColor = "#fbb03b",
  // 中间点半径
  midpointRadius = 3,

  /**
   * line
   * */ 
   baseLineInactiveColor = "#3bb2d0",
   baseLineInactiveWidth = 3,
   baseLineActiveColor ="#fbb03b" ,
   baseLineActiveWidth = 2,
  /**
   * point
   *  */
  basePointInactiveRadius = 3,
  basePointActiveRadius = 5,
  basePointStrokeActiveRadius = 7, 
  basePointInactiveColor = "#fbb03b",
  basePointActiveColor = "#fff",
  basePointStrokeActiveColor = "#3bb2d0"
export default [
  /** 默认样式 */
  {
    'id': 'gl-draw-polygon-fill-inactive',
    'type': 'fill',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'fill-color': ['case', ['to-boolean', color], color, baseFillInactiveColor],
      'fill-outline-color': ['case', ['to-boolean', color], color, baseFillOutlineInactiveColor],
      'fill-opacity': [
        'case',
        ['==', opacity, 0],
        0,
        ['to-boolean', opacity],
        opacity,
        0.1
      ]
    }
  },
  {
    'id': 'gl-draw-polygon-fill-active',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': ['case', ['to-boolean', color], color, baseFillActiveColor],
      'fill-outline-color': ['case', ['to-boolean', color], color, baseFillOutlineActiveColor],
      'fill-opacity': [
        'case',
        ['==', opacity, 0],
        0,
        ['to-boolean', opacity],
        opacity,
        0.1
      ]
    }
  },
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': ['case', ['to-boolean', radius], radius, midpointRadius],
      'circle-color': ['case', ['to-boolean', color], color, midpointColor]
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': ['case', ['to-boolean', color], color, baseFillStrokeInactiveColor],
      'line-width': ['case', ['to-boolean', width], width, baseFillStrokeInactiveWidth],
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color':  ['case', ['to-boolean', color], color, baseFillStrokeActiveColor],
      'line-dasharray': [0.2, 2],
      'line-width': ['case', ['to-boolean', width], width, baseFillStrokeActiveWidth]
    }
  },
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': ['case', ['to-boolean', color], color, baseLineInactiveColor],
      'line-width': ['case', ['to-boolean', width], width, baseLineInactiveWidth]
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': ['case', ['to-boolean', color], color, baseLineActiveColor],
      'line-dasharray': [0.2, 2],
      'line-width': ['case', ['==', width, 0], 0, ['to-boolean', width], baseLineActiveWidth, 2]
  }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': ['case', ['to-boolean', radius], radius, 5],
      'circle-color': ['case', ['to-boolean', color], color, '#fff'] 
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': ['case', ['to-boolean', radius], radius, 5],
      'circle-color': ['case', ['to-boolean', color], color, '#fbb03b'] 
    }
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
      ['!=', 'user__type', 'text'],
      ['!=', 'user__type', 'measure_result_text']
    ],
    'paint': {
      'circle-radius':  ['+', size, 3],
      'circle-opacity': ['case', ['to-boolean', opacity], opacity, 1] ,
      'circle-color': ['case', ['to-boolean', color], color, '#fff'],
    }
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
      ['!=', 'user__type', 'text'],
      ['!=', 'user__type', 'measure_result_text']
    ],
    'paint': {
      
      'circle-radius': ['case', ['to-boolean', radius], radius, basePointInactiveRadius],
      'circle-color':  ['case', ['to-boolean', color], color, basePointInactiveColor]
    }
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
      ['!=', 'user__type', 'text'],
      ['!=', 'user__type', 'measure_result_text']
    ],
    'paint': {
      'circle-radius': ['case', ['to-boolean', radius], radius, basePointStrokeActiveRadius],
      'circle-color':  ['case', ['to-boolean', color], color, basePointStrokeActiveColor]
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true']],
    'paint': {
      'circle-radius': ['case', ['to-boolean', radius], radius, basePointActiveRadius],
      'circle-color':  ['case', ['to-boolean', color], color, basePointActiveColor]
    }
  },
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-point-static',
    'type': 'circle',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#404040'
    }
  },
  // 文字样式
  {
    id: 'gl-draw-text-inactive',
    type: 'symbol',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'user__type', 'text'],
      ['==', 'active', 'false']
    ],
    paint: {
      'text-color': ['case', ['to-boolean', color], color, textColor],
    },
    layout: {
      'text-size': size,
      'text-field': text,
      'text-font':textFont,
      'text-allow-overlap': true
    }
  },
  {
    id: 'gl-draw-text-active',
    type: 'symbol',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'user__type', 'text'],
      ['==', 'active', 'true']
    ],
    paint: {
      'text-halo-blur': 2,
      'text-halo-color': '#fff',
      'text-halo-width': 1,
      'text-color': ['case', ['to-boolean', color], color, textColor],
    },
    layout: {
      'text-size': ['+', size, 2],
      'text-field': text,
      'text-font':textFont,
      'text-allow-overlap': true
    }
  },
  {
    id: 'gl-draw-measure_result',
    type: 'symbol',
    filter: ['all', ['in', ['get', 'user__type'], 'measure_result_text']],
    paint: {
      'text-halo-blur': 2,
      'text-halo-color': '#fff',
      'text-halo-width': 1,
      'text-color': '#f00'
    },
    layout: {
      'text-size': 16,
      'text-offset': [0, 1.2],
      'text-font': textFont,
      'text-field': '{user__measure_result}',
      'text-allow-overlap': true
    }
  }
];
