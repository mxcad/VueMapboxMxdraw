///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { random } from "@/mxthree/utils";
import * as turf from "@turf/turf"
import { GUI } from "dat.gui";
import { LineLayer, FillLayer, FillExtrusionLayer } from "mapbox-gl";
import { MxMapBox } from "..";
import { interpolate } from "../animate";
import { DiffusionDotMarker } from "../pointTag/diffusionDot";
import kriging from '@sakitam-gis/kriging';

// 克里金插值计算等值面
export function isolineAnalyzing() {
  const map = MxMapBox.getMap()

  // 生成等值线选的参数
  let params = {
    minValue: 0, // 等值线参考值的最小值
    maxValue: 300, // 等值线参考值的最大值
    krigingModel: 'exponential', //model还可选'gaussian','spherical',exponential
    krigingSigma2: 0, // 克里金高斯过程的方差参数
    krigingAlpha: 100, // 变差函数模型的先验
    colors: ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf","#fee08b",
    "#fdae61", "#f46d43", "#d73027", "#a50026"], // 渐变的颜色值
    maxHeight: 300, // 最大拉伸高度,
    evenness: 500 // 等值线的平滑度 
  };

  // 生成随机点
  const bounds = map.getBounds().toArray()
  const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
  const points = turf.randomPoint(80, { bbox })
  points.features = points.features.map((feature)=> {
      if(feature.properties) feature.properties.value = random(params.minValue, params.maxValue)
      return feature
  })

  //利用网格计算点集
  const gridFeatureCollection = function (grid:any) {
      let range =grid.zlim[1] - grid.zlim[0];
      let i, j, x, y, z;
      let n = grid.data.length;//列数
    
      let m = grid.data[0].length;//行数
      let pointArray = [];
      for (i = 0; i < n ; i++)
          for (j = 0; j < m ; j++) {
              x = (i) * grid.width + grid.xlim[0];
              y = (j) * grid.width + grid.ylim[0];
              z = (grid.data[i][j] - grid.zlim[0]) / range;
              if (z < 0.0) z = 0.0;
              if (z > 1.0) z = 1.0;
              pointArray.push(turf.point([x, y], { value: z }));
          }
      return pointArray;
  }


 

  // 创建等值线数据
  const createIsolineData = (points:turf.helpers.FeatureCollection<turf.helpers.Point, any>, bbox: turf.helpers.BBox, zProperty:string, contoursSize:number,  params?: {
    minValue?: number;
    maxValue?: number;
    colors?: string[];
    maxHeight?: number;
    krigingModel?: string;
    krigingSigma2?: number;
    krigingAlpha?: number;
    evenness?: number
  })=> {
    if(!params) params = {}
    let { 
      minValue = 0,
      maxValue = 100, 
      colors = ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf","#fee08b",
      "#fdae61", "#f46d43", "#d73027", "#a50026"],
      maxHeight = 100,
      krigingModel = "exponential",
      krigingSigma2 = 0,
      krigingAlpha = 100,
      evenness = 500 
    } = params
    
    // 创建插值参数
    let interpolateInput: number[] = [], interpolateOutput: any[] = [];
    for(let i = 0; i < colors.length; i++) {
        interpolateInput.push(i / (colors.length - 1)); // 插值输入值，这里输入0-1之间的比例
        interpolateOutput.push(colors[i]) // 插值输出值，这里输入0-1之间的比例对应的颜色值
    }
    // 根据比例插值颜色
    const mapProgressToValues = (value: number) => interpolate(
        interpolateInput,
        interpolateOutput
    )(value)
   
    // 把原数据的颜色也设置下，绘制marker需要
    points.features.forEach(f => f.properties.color = mapProgressToValues((f.properties.value - minValue) / (maxValue - minValue)))

    // 记录随机点的经纬度和参考值(如高度/温度值以value表示)
    let values: number[] = [], lngs: number[] = [], lats: number[] = [];
    points.features.forEach(feature => {
        // 记录参考值 zProperty参数表示参考值的属性名
        values.push(feature.properties[zProperty]);
        lngs.push(feature.geometry.coordinates[0]);
        lats.push(feature.geometry.coordinates[1]);
    })

    // 当可以根据参考值生成等线值数据时
    if (values.length > 3) {
      // 利用kriging库提供的 train 方法 它会将输入拟合到您指定的任何变异函数模型 - 高斯、指数或球形 - 并返回一个变异函数对象
      let variogram = kriging.train(
        values,
        lngs,
        lats,
        krigingModel, 
        krigingSigma2,
        krigingAlpha
      );

      // 根据提供的边界和变异函数对象生成指定间距宽度的网格数据
      let polygons = [];
      polygons.push([
          [bbox[0], bbox[1]], [bbox[0], bbox[3]],
          [bbox[2], bbox[3]], [bbox[2], bbox[1]]
      ]);
      let grid = kriging.grid(polygons, variogram, (bbox[2] - bbox[0]) / evenness);

      // 利用网格生成对应的点集数据
      let fc = gridFeatureCollection(grid);
      // 将点集数组转换为GEOJSON数据格式
      const collection = turf.featureCollection(fc);

      // 等值线断层(可以直接使用成 0~1 的渐变数组, 这里可以通过contoursSize来控制等值线轮廓的大小密集程度)
      const breaks = [];
      for(let i = 0; i < contoursSize; i++) {
        breaks.push((minValue + (maxValue - minValue) * i /  (contoursSize - 1)) / maxValue);
      }
      // const breaks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

      // 得到最终的等值线数据
      const isobandsData = turf.isobands(collection, breaks, { zProperty });
      // 按照面积对图层进行排序，规避turf的一个bug
      function sortArea(a: turf.helpers.Geometry | turf.helpers.Feature<any, turf.helpers.Properties> | turf.helpers.FeatureCollection<any, turf.helpers.Properties>,b: turf.helpers.Geometry | turf.helpers.Feature<any, turf.helpers.Properties> | turf.helpers.FeatureCollection<any, turf.helpers.Properties>)
      {
          return turf.area(b)-turf.area(a);
      }
      isobandsData.features.sort(sortArea)

      // 将等值线数据的颜色和拉伸高度等信息进行赋值(重新转换 value, 因为kriging库自己对value属性做了一次处理, 可以不需要转换, 这里转换成数字使用上更灵活一些)
      for(let i = 0; i < isobandsData.features.length; i++) {
        let prop = isobandsData.features[i].properties as any;
        
        // 计算插值 (因为kriging已经对value进行了插值计算 可以直接使用value)
        // let r = (value * maxValue - minValue) / (maxValue - minValue);
        let value = parseFloat(prop.value.split('-')[0])
        prop.value = value
        prop.color = mapProgressToValues(value); // 插值出颜色值
        
        prop.height = maxHeight * value; // 插值出要拉伸的高度值
      }

      return isobandsData
    }
  }
  // 创建等值线数据
  const contour = createIsolineData(points, bbox, 'value', 20, params)
  let markers: string | any[] | null
  const addMarkers = ()=> {
      if (markers) return;
      markers = points.features.map(f => {
          if(f.properties) {
              const _marker = new DiffusionDotMarker({
                  width: 10,
                  text: f.properties.value.toFixed(0),
                  textColor: f.properties.color,
                  backgroundColor: f.properties.color,
                  shadowColor: `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
                  pitchAlignment: "map", // 与地图对齐，缺省是"viewport"对齐
                  rotationAlignment: "map",// 与地图对齐，缺省是"viewport"对齐
                  scaleMaxZoom: 14, // 最大缩放 当zoom大于12时，则标签保持原样 小于则自动缩放
              }).setLngLat(f.geometry.coordinates).addTo(map)   
              return _marker
          }
      })
  }
    const removeMarkers = ()=> {
        if (!markers) return;
        for(let i = markers.length - 1; i >= 0; i--) {
            markers[i].remove();
        }
        markers = null;
    }

    map.addSource('isolineAnalyzing_source', {
        data: contour,
        type: "geojson"
    })

    let polyline: LineLayer | null = null;
    const addPolyline = ()=> {
        if (polyline) return;
        map.addLayer({
            id: "isolineAnalyzing_polyline",
            type: "line",
            source: "isolineAnalyzing_source",
            paint: {
                "line-color":  ['get', 'color']
            }
        })
        polyline = map.getLayer('isolineAnalyzing_polyline') as LineLayer
    }
    const removePolyline = ()=> {
        if (!polyline) return;
        map.removeLayer('isolineAnalyzing_polyline')
        polyline = null;
    }

    let polygon: FillLayer | null = null;
    const addPolygon = ()=> {
        if (polygon) return;
        map.addLayer({
            id: "isolineAnalyzing_polygon",
            source: "isolineAnalyzing_source",
            type: "fill",
            paint: {
                "fill-color": ['get', 'color'],
                "fill-opacity": 0.9
            }
        })
        polygon = map.getLayer('isolineAnalyzing_polygon') as FillLayer
    }
    const removePolygon = ()=> {
        if (!polygon) return;
        map.removeLayer('isolineAnalyzing_polygon')
        polygon = null;
    }


    let fillExtrusions: FillExtrusionLayer | null = null;
    
    const addFillExtrusion = ()=> {
        if (fillExtrusions) return;
        map.addLayer({
            id: "isolineAnalyzing_fill_extrusions",
            source: "isolineAnalyzing_source",
            type: "fill-extrusion",
            paint: {
                "fill-extrusion-color": ['get', 'color'],
                "fill-extrusion-opacity": 0.8,
                "fill-extrusion-height": ['get', 'height'],
                "fill-extrusion-base": 0
            }
        })
        fillExtrusions = map.getLayer('isolineAnalyzing_fill_extrusions') as FillExtrusionLayer
    }
    const removeFillExtrusion = ()=> {
        if (!fillExtrusions) return;
        map.removeLayer('isolineAnalyzing_fill_extrusions');
        fillExtrusions = null;
    }

    const mockDataChange = ()=> {
      // 重新随机生成参考值
      points.features.forEach(f => f.properties.value = random(params.minValue, params.maxValue));
      // 创建并设置等值线数据
      const isolineData = createIsolineData(points, bbox, 'value', 20, params)
      const source = map.getSource('isolineAnalyzing_source') as any
      if(source && isolineData) source.setData(isolineData)
    }

    addMarkers();
    addPolyline();
    const gui = new GUI()

    gui.add({ addMarkers }, 'addMarkers').name('添加源点')
    gui.add({ removeMarkers }, 'removeMarkers').name('删除源点')

    gui.add({ addPolyline }, 'addPolyline').name('添加等值线')

    gui.add({ removePolyline }, 'removePolyline').name('删除等值线')

    gui.add({ addPolygon }, 'addPolygon').name('添加等值面')

    gui.add({ removePolygon }, 'removePolygon').name('删除等值面')

    gui.add({ addFillExtrusion }, 'addFillExtrusion').name('添加等值面拉伸')

    gui.add({ removeFillExtrusion }, 'removeFillExtrusion').name('删除等值面拉伸')

    gui.add({ mockDataChange }, 'mockDataChange').name('数据更新')
    map.on('remove', ()=> {
        gui.destroy()
    })

}


// 等值线分析
// export function isolineAnalyzing() {
//     const map = MxMapBox.getMap()
//     //生成测试数据
//     let dataMinValue = 10; // 数据最小值
//     let dataMaxValue = 100; // 数据最大值
//     const bounds = map.getBounds().toArray()
//     const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
//     let pointsData =  turf.pointGrid(bbox, 0.2, {units: 'miles'})
//     pointsData.features = pointsData.features.map((feature)=> {
//        if(feature.properties) feature.properties.value = random(dataMinValue, dataMaxValue)
//         return feature
//     })

//     // 区间颜色值
//     let colors = ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf","#fee08b",
//     "#fdae61", "#f46d43", "#d73027", "#a50026"];

//     let contoursSize = 10; // 等值面分级区间数，这里设置为20，可以自行设置
    
//     // 创建轮廓的函数
//     const createContour = (points: turf.helpers.FeatureCollection<turf.helpers.Point, any>, zProperty: string, contoursSize: number, colors: string | any[], dataMinValue: number, dataMaxValue: number, maxHeight: number) => {
//         let contours = [];
//         for(let i = 0; i < contoursSize; i++) {
//             contours.push(dataMinValue + (dataMaxValue - dataMinValue) * i /  (contoursSize - 1));
//         }

//         let interpolateInput: number[] = [], interpolateOutput: any[] = [];
//         for(let i = 0; i < colors.length; i++) {
//             interpolateInput.push(i / (colors.length - 1)); // 插值输入值，这里输入0-1之间的比例
//             interpolateOutput.push(colors[i]) // 插值输出值，这里输入0-1之间的比例对应的颜色值
//         }

//         let contour = turf.isolines(points, contours, { zProperty })
//         const bbox = turf.bbox(contour);
//         const bboxPolygon = turf.bboxPolygon(bbox);
//         // 根据比例插值颜色
//         const mapProgressToValues = (value: number) => interpolate(
//             interpolateInput,
//             interpolateOutput
//         )(value)
 
//         // 把原数据的颜色也设置下，绘制marker需要
//         points.features.forEach(f => f.properties.color = mapProgressToValues((f.properties.value - dataMinValue) / (dataMaxValue - dataMinValue)))
    
//         let h = maxHeight; // 设置最大值要拉伸的高度
        
//         for(let i = 0; i < contour.features.length; i++) {
//             let prop = contour.features[i].properties as any;
//             let r = (prop.value - dataMinValue) / (dataMaxValue - dataMinValue);
            
//             // // 等值线平滑
//             contour.features[i].geometry.coordinates = contour.features[i].geometry.coordinates.map((coordinates)=> {
//                const lines = turf.bezierSpline(turf.lineString(coordinates))
//                return lines.geometry.coordinates
//             })
            
//             prop.color = mapProgressToValues(r); // 插值出颜色值
            
//             prop.height = h * r; // 插值出要拉伸的高度值
//         }
//         contour.features.push(turf.multiLineString(bboxPolygon.geometry.coordinates))
//         return contour;
//     }

//     let contour = createContour(pointsData,'value', contoursSize, colors, dataMinValue, dataMaxValue, 500);

//     let markers: string | any[] | null = null;

//     const addMarkers = ()=> {
//         if (markers) return;
//         markers = pointsData.features.map(f => {
//             if(f.properties) {
//                 const _marker = new DiffusionDotMarker({
//                     width: 10,
//                     text: f.properties.value.toFixed(0),
//                     textColor: f.properties.color,
//                     backgroundColor: f.properties.color,
//                     shadowColor: `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
//                     pitchAlignment: "map", // 与地图对齐，缺省是"viewport"对齐
//                     rotationAlignment: "map",// 与地图对齐，缺省是"viewport"对齐
//                 }).setLngLat(f.geometry.coordinates).addTo(map)   
//                 return _marker
//             }
//         })
//     }
//     const removeMarkers = ()=> {
//         if (!markers) return;
//         for(let i = markers.length - 1; i >= 0; i--) {
//             markers[i].remove();
//         }
//         markers = null;
//     }

//     map.addSource('isolineAnalyzing_source', {
//         data: contour,
//         type: "geojson"
//     })

//     let polyline: LineLayer | null = null;
//     const addPolyline = ()=> {
//         if (polyline) return;
//         map.addLayer({
//             id: "isolineAnalyzing_polyline",
//             type: "line",
//             source: "isolineAnalyzing_source",
//             paint: {
//                 "line-color":  ['get', 'color']
//             }
//         })
//         polyline = map.getLayer('isolineAnalyzing_polyline') as LineLayer
//     }
//     const removePolyline = ()=> {
//         if (!polyline) return;
//         map.removeLayer('isolineAnalyzing_polyline')
//         polyline = null;
//     }

//     let polygon: FillLayer | null = null;
//     const addPolygon = ()=> {
//         if (polygon) return;
//         map.addLayer({
//             id: "isolineAnalyzing_polygon",
//             source: "isolineAnalyzing_source",
//             type: "fill",
//             paint: {
//                 "fill-color": ['get', 'color'],
//                 "fill-opacity": 0.9
//             }
//         })
//         polygon = map.getLayer('isolineAnalyzing_polygon') as FillLayer
//     }
//     const removePolygon = ()=> {
//         if (!polygon) return;
//         map.removeLayer('isolineAnalyzing_polygon')
//         polygon = null;
//     }


//     let fillExtrusions: FillExtrusionLayer | null = null;
    
//     const addFillExtrusion = ()=> {
//         if (fillExtrusions) return;
//         map.addLayer({
//             id: "isolineAnalyzing_fill_extrusions",
//             source: "isolineAnalyzing_source",
//             type: "fill-extrusion",
//             paint: {
//                 "fill-extrusion-color": ['get', 'color'],
//                 "fill-extrusion-opacity": 0.8,
//                 "fill-extrusion-height": ['get', 'height'],
//                 "fill-extrusion-base": 0
//             }
//         })
//         fillExtrusions = map.getLayer('isolineAnalyzing_fill_extrusions') as FillExtrusionLayer
//     }
//     const removeFillExtrusion = ()=> {
//         if (!fillExtrusions) return;
//         map.removeLayer('isolineAnalyzing_fill_extrusions');
//         fillExtrusions = null;
//     }

//     const mockDataChange = ()=> {

//     }

//     addMarkers();
//     addPolyline();
//     const gui = new GUI()

//     gui.add({ addMarkers }, 'addMarkers').name('添加源点')
//     gui.add({ removeMarkers }, 'removeMarkers').name('删除源点')

//     gui.add({ addPolyline }, 'addPolyline').name('添加等值线')

//     gui.add({ removePolyline }, 'removePolyline').name('删除等值线')

//     gui.add({ addPolygon }, 'addPolygon').name('添加等值面')

//     gui.add({ removePolygon }, 'removePolygon').name('删除等值面')

//     gui.add({ addFillExtrusion }, 'addFillExtrusion').name('添加等值面拉伸')

//     gui.add({ removeFillExtrusion }, 'removeFillExtrusion').name('删除等值面拉伸')

//     gui.add({ mockDataChange }, 'mockDataChange').name('数据更新')
//     map.on('remove', ()=> {
//         gui.destroy()
//     })
// }


// export function isolineAnalyzing() {
//     const map = MxMapBox.getMap()
//     //生成测试数据
//     const bounds = map.getBounds().toArray()
//     const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
//     let boundaries = turf.randomPolygon(1, { bbox})
      
//     let points = turf.randomPoint(30, { bbox: turf.bbox(boundaries) });

//     turf.featureEach(points, function (currentFeature, featureIndex) {
//         currentFeature.properties = { value: (Math.random() * 100).toFixed(2) };
//     });

//     let grid = turf.interpolate(points, 0.05, {
//         gridType: "point",
//         property: "value",
//         units: "degrees",
//         weight: 10
//     });
//     grid.features.map((i) => (i.properties ? i.properties.value = i.properties.value.toFixed(2): void 0));

//     let isobands = turf.isobands(
//         grid,
//         [1, 10, 20, 30, 50, 70, 100],
//         {
//             zProperty: "value",
//             commonProperties: {
//                 "fill-opacity": 0.8
//             },
//             breaksProperties: [
//                 {fill: "#e3e3ff"},
//                 {fill: "#c6c6ff"},
//                 {fill: "#a9aaff"},
//                 {fill: "#8e8eff"},
//                 {fill: "#7171ff"},
//                 {fill: "#5554ff"},
//                 {fill: "#3939ff"},
//                 {fill: "#1b1cff"},
//                 {fill: "#1500ff"}
//             ]
//         }
//     );
   
      
//     boundaries = turf.flatten(boundaries as any) as any
//     isobands = turf.flatten(isobands) as any

//     let features: turf.helpers.Feature<turf.helpers.Geometry, turf.helpers.Properties>[] = [];

//     isobands.features.forEach(function (layer1) {

//     boundaries.features.forEach(function (layer2:any) {
//         let intersection = null;
//         try {
//         intersection = turf.intersect(layer1, layer2);
//         } catch (e) {
//         layer1 = turf.buffer(layer1, 0);
//         intersection = turf.intersect(layer1, layer2);
//         }
//         if (intersection != null) {
//             intersection.properties = layer1.properties;
//             intersection.id = Math.random() * 100000;
//             features.push(intersection);
//         }
//     });
//     });
//     let intersection = turf.featureCollection(features);
//     // 逐个添加过程中的数据
//   map.addSource("boundaries", {
//     type: "geojson",
//     data: boundaries as any
//   });
//   map.addSource("points", {
//     type: "geojson",
//     data: points
//   });
//   map.addSource("grid", {
//     type: "geojson",
//     data: grid
//   });
//   map.addSource("isobands", {
//     type: "geojson",
//     data: isobands
//   });
//   map.addSource("intersection", {
//     type: "geojson",
//     data: intersection as any
//   });
//   // 逐个添加过程中形成的图层
//   map.addLayer({
//     id: "points",
//     type: "symbol",
//     source: "points",
//     layout: {
//       "text-field": ["get", "value"],
//       "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
//       "text-offset": [0, 0.6],
//       "text-anchor": "top"
//     }
//   });
//   map.addLayer({
//     id: "circles",
//     type: "circle",
//     source: "points",
//     'paint': {
//       'circle-radius': 2,
//       'circle-color': '#007cbf'
//     }
//   });
//   map.addLayer({
//     id: "grid",
//     type: "symbol",
//     source: "grid",
//     layout: {
//       "text-field": ["get", "value"],
//       "visibility": "none"
//     },
//     paint: {
//       "text-color": "#f00"
//     }
//   });
  
//   map.addLayer({
//     id: "isobands",
//     type: "fill",
//     source: "isobands",
//     layout: {
//     //   "visibility": "none"
//     },
//     paint: {
//       "fill-color": ["get", "fill"],
//       "fill-opacity": 0.8
//     }
//   })
//   map.addLayer({
//     id: "boundaries",
//     type: "line",
//     source: "boundaries",
//     layout: {},
//     paint: {
//       "line-width": 2,
//       "line-color": "#4264fb"
//     }
//   })
//   map.addLayer({
//     id: "intersection",
//     type: "fill",
//     source: "intersection",
//     layout: {},
//     paint: {
//       "fill-color": ["get", "fill"],
//       "fill-opacity": [
//         "case",
//         ["boolean", ["feature-state", "hover"], false],
//         0.8,
//         0.5
//       ],
//       "fill-outline-color": [
//         "case",
//         ["boolean", ["feature-state", "hover"], false],
//         "#000",
//         "#fff"
//       ]
//   }})
// }