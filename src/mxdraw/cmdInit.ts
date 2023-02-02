///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////



import { MxFun } from "mxdraw"
import Mx_Personnel_positioning from "@/mapbox/demo/Mx_Personnel_positioning"
import { Mx_city_3d } from "@/mapbox/demo/Mx_city_3d"
import { Mx_CADGISDemo } from "@/mapbox/demo/Mx_cadandgis"

import Mx_Three_Diamond_Tag from "@/mxthree/MxThreeDiamondTag"
import Mx_Three_Diffusion_Halo from "@/mxthree/MxThreeDiffusionHalo"
import Mx_Three_Fly_Line from "@/mxthree/MxThreeFlyLine"
import Mx_Three_Radar from "@/mxthree/MxThreeRadar"
import Mx_Three_Radial_Gradient_Sphere from "@/mxthree/MxThreeRadialGradientSphere"
import Mx_Three_Stereo_Light_Wall from "@/mxthree/MxThreeStereoLightWall"
import Mx_Three_Wave_Light_Wall from "@/mxthree/MxThreeWaveLightWall"
import Mx_Load_GLTF_model from "@/mapbox/demo/Mx_Load_GLTF_model"
import Mx_Stretching_Model from "@/mapbox/demo/Mx_Stretching_Model"
import Mx_Three_layer from "@/mapbox/demo/Mx_Three_layer"
import { Mx_Deck_Arc_Layer } from "@/deckgl/Mx_Deck_Arc_Layer"
import { Mx_Deck_Scatterplot_Layer } from "@/deckgl/Mx_Deck_Scatterplot_Layer"
import { Mx_Deck_Contour_Map_Layer } from "@/deckgl/Mx_Deck_Contour_Map_Layer"
import { Mx_Deck_LineAnimation_Layer } from "@/deckgl/Mx_Deck_LineAnimation_Layer"
import { Mx_Deck_Filling_Pattern_Layer } from "@/deckgl/Mx_Deck_Filling_Pattern_Layer"
import { Mx_Deck_Point_Cloud_Layer } from "@/deckgl/Mx_Deck_Point_Cloud_Layer"
import { Mx_Deck_Scenario_Layer } from "@/deckgl/Mx_Deck_Scenario_Layer"
import { Mx_Deck_Grid_Layer } from "@/deckgl/Mx_Deck_Grid_Layer"
import { Mx_Deck_Model_Layer } from "@/deckgl/Mx_Deck_Model_Layer"
import { Mx_Deck_Flow_Path_Layer } from "@/deckgl/Mx_Deck_Flow_Path_Layer"
import Mx_L7_Beam_Path_Animation from "@/L7/Mx_L7_Beam_Path_Animation"
import Mx_L7_Flight_Line_Animation from "@/L7/Mx_L7_Flight_Line_Animation"
import Mx_L7_Figure3d_Honeycomb from "@/L7/Mx_L7_Figure3d_Honeycomb"
import Mx_L7_Gradient_Histogram from "@/L7/Mx_L7_Gradient_Histogram"
import Mx_L7_Contour from "@/L7/Mx_L7_Contour"
import Mx_L7_Grid_Diagram from "@/L7/Mx_L7_Grid_Diagram"
import { loadThirdPartyMaps } from "@/mapbox/plugins/InternetMap/loadThirdPartyMaps"
import { addMinMpaContorl } from "@/mapbox/control/addMinMpaContorl"
import { addMapContorl } from "@/mapbox/control/addMapContorl"
import { strivesForTheClosestPoint } from "@/mapbox/calculate/strivesForTheClosestPoint"
import { computingTheShortestPath } from "@/mapbox/calculate/computingTheShortestPath"
import { backgroundLayer } from "@/mapbox/layer/backgroundLayer"
import { customWatermarkBackgroundLayer } from "@/mapbox/layer/customWatermarkBackgroundLayer"
import { heatmapLayer } from "@/mapbox/layer/heatmapLayer"
import { radarLayer } from "@/mapbox/layer/radarLayer"
import { skyLayer } from "@/mapbox/layer/skyLayer"
import { addDrawTool } from "@/mapbox/draw/addDrawTool"
import { circleAnimate } from "@/mapbox/animate/circleAnimate"
import { annulusAnimation } from "@/mapbox/animate/annulusAnimation"
import { stretchAnimation } from "@/mapbox/animate/stretchAnimation"
import { dottedLinePathAnimation } from "@/mapbox/animate/dottedLinePathAnimation"
import { linePatternPathAnimation } from "@/mapbox/animate/linePatternPathAnimation"
import { multiSegmentStretchAnimation } from "@/mapbox/animate/multiSegmentStretchAnimation"
import { iconPathAnimation } from "@/mapbox/animate/iconPathAnimation"
import { customIconAnimation } from "@/mapbox/animate/customIconAnimation"
import { MxCircleTest } from "@/mapbox/graphics/MxCircle"
import { MxCurveTest } from "@/mapbox/graphics/MxCurve"
import { MxEllipseTest } from "@/mapbox/graphics/MxEllipse"
import { phosphorDot } from "@/mapbox/pointTag/phosphorDot"
import { diffusionDot } from "@/mapbox/pointTag/diffusionDot"
import { apertureOfBreath } from "@/mapbox/pointTag/apertureOfBreath"
import { glowingHalo } from "@/mapbox/pointTag/glowingHalo"
import { rotatingHalo } from "@/mapbox/pointTag/rotatingHalo"
import { rotatedTextBox } from "@/mapbox/pointTag/rotatedTextBox"
import { zoomTag } from "@/mapbox/pointTag/zoomTag"
import { mapViewDisplayTag } from "@/mapbox/pointTag/mapViewDisplayTag"
import { overlapTag } from "@/mapbox/pointTag/overlapTag"
import { rightClickMenu } from "@/mapbox/pointTag/rightClickMenu"
import { setHeight } from "@/mapbox/pointTag/setHeight"
import { pointSymbolAggregation } from "@/mapbox/pointTag/pointSymbolAggregation"
import { dotSymbolsAggregateCustomIcons } from "@/mapbox/pointTag/dotSymbolsAggregateCustomIcons"
import { pointMarkerAggregation } from "@/mapbox/pointTag/pointMarkerAggregation"
import { isolineAnalyzing } from "@/mapbox/calculate/isolineAnalyzing"
import { bufferCalculation } from "@/mapbox/calculate/bufferCalculation"
import Mx_L7_Bubble_Animation from "@/L7/Mx_L7_Bubble_Animation"
import { Mx_Deck_CompositeLayer } from "@/deckgl/Mx_Deck_CompositeLayer"
import { drawingNotation } from "@/mapbox/draw/drawingNotation"
import { dotSymbolAnimation } from "@/mapbox/animate/dotSymbolAnimation"
import { webGlLayer } from "@/mapbox/layer/webGlLayer"
import { DivOverlayTest } from "@/mapbox/draw/DivOverlay"
import { SvgOverlayTest } from "@/mapbox/draw/SvgOverlay"




export function cmdInit() {
    // demo
    MxFun.addCommand('Mx_Personnel_positioning', Mx_Personnel_positioning)
    MxFun.addCommand('Mx_city_3d', Mx_city_3d)
    MxFun.addCommand('Mx_CADGISDemo', Mx_CADGISDemo)
    
    // three
    
    MxFun.addCommand('Mx_Three_Diamond_Tag', Mx_Three_Diamond_Tag)
    MxFun.addCommand('Mx_Three_Diffusion_Halo', Mx_Three_Diffusion_Halo)
    MxFun.addCommand('Mx_Three_Fly_Line', Mx_Three_Fly_Line)
    MxFun.addCommand('Mx_Three_Radar', Mx_Three_Radar)
    MxFun.addCommand('Mx_Three_Radial_Gradient_Sphere', Mx_Three_Radial_Gradient_Sphere)
    MxFun.addCommand('Mx_Three_Stereo_Light_Wall', Mx_Three_Stereo_Light_Wall)
    MxFun.addCommand('Mx_Three_Wave_Light_Wall', Mx_Three_Wave_Light_Wall)
    
    MxFun.addCommand('Mx_Load_GLTF_model', Mx_Load_GLTF_model)
    MxFun.addCommand('Mx_Stretching_Model', Mx_Stretching_Model)
    MxFun.addCommand('Mx_Three_layer', Mx_Three_layer)

    // deck.gl
    MxFun.addCommand('Mx_Deck_Arc_Layer', Mx_Deck_Arc_Layer)
    MxFun.addCommand('Mx_Deck_Scatterplot_Layer', Mx_Deck_Scatterplot_Layer)
    MxFun.addCommand('Mx_Deck_Contour_Map_Layer', Mx_Deck_Contour_Map_Layer)
    MxFun.addCommand('Mx_Deck_LineAnimation_Layer', Mx_Deck_LineAnimation_Layer)
    MxFun.addCommand('Mx_Deck_Filling_Pattern_Layer', Mx_Deck_Filling_Pattern_Layer)
    MxFun.addCommand('Mx_Deck_Point_Cloud_Layer', Mx_Deck_Point_Cloud_Layer)
    MxFun.addCommand('Mx_Deck_Scenario_Layer', Mx_Deck_Scenario_Layer)
    MxFun.addCommand('Mx_Deck_Grid_Layer', Mx_Deck_Grid_Layer)
    MxFun.addCommand('Mx_Deck_Model_Layer', Mx_Deck_Model_Layer)
    MxFun.addCommand('Mx_Deck_Flow_Path_Layer', Mx_Deck_Flow_Path_Layer)
    MxFun.addCommand('Mx_Deck_CompositeLayer', Mx_Deck_CompositeLayer)
    
    
    // L7
    MxFun.addCommand('Mx_L7_Beam_Path_Animation', Mx_L7_Beam_Path_Animation)
    MxFun.addCommand('Mx_L7_Flight_Line_Animation', Mx_L7_Flight_Line_Animation)
    MxFun.addCommand('Mx_L7_Figure3d_Honeycomb', Mx_L7_Figure3d_Honeycomb)
    MxFun.addCommand('Mx_L7_Gradient_Histogram', Mx_L7_Gradient_Histogram)
    MxFun.addCommand('Mx_L7_Contour', Mx_L7_Contour)
    MxFun.addCommand('Mx_L7_Grid_Diagram', Mx_L7_Grid_Diagram)
    MxFun.addCommand('Mx_L7_Bubble_Animation', Mx_L7_Bubble_Animation)

    
    // 第三方地图
    MxFun.addCommand('Mx_Internet_Map_bdsl', loadThirdPartyMaps.bdsl)
    MxFun.addCommand('Mx_Internet_Map_bdyx', loadThirdPartyMaps.bdyx)
    MxFun.addCommand('Mx_Internet_Map_gdsl', loadThirdPartyMaps.gdsl)
    MxFun.addCommand('Mx_Internet_Map_gdslwzj', loadThirdPartyMaps.gdslwzj)
    MxFun.addCommand('Mx_Internet_Map_gdyx', loadThirdPartyMaps.gdyx)

    MxFun.addCommand('Mx_Internet_Map_geoq', loadThirdPartyMaps.geoq)
 
    MxFun.addCommand('Mx_Internet_Map_geoqGray', loadThirdPartyMaps.geoqGray)
    MxFun.addCommand('Mx_Internet_Map_geoqPurplishBlue', loadThirdPartyMaps.geoqPurplishBlue)
    MxFun.addCommand('Mx_Internet_Map_geoqWarm', loadThirdPartyMaps.geoqWarm)
    MxFun.addCommand('Mx_Internet_Map_osm', loadThirdPartyMaps.osm)
    MxFun.addCommand('Mx_Internet_Map_tdtdx', loadThirdPartyMaps.tdtdx)
    MxFun.addCommand('Mx_Internet_Map_tdtsl', loadThirdPartyMaps.tdtsl)
    MxFun.addCommand('Mx_Internet_Map_tdtyx', loadThirdPartyMaps.tdtyx)    
    
    // 控件
    MxFun.addCommand('addMinMpaContorl', addMinMpaContorl)    
    MxFun.addCommand('addMapContorl', addMapContorl)    
    MxFun.addCommand('addDrawTool', addDrawTool)
    // 几何计算
    MxFun.addCommand('strivesForTheClosestPoint', strivesForTheClosestPoint)    
    MxFun.addCommand('computingTheShortestPath', computingTheShortestPath)    
    MxFun.addCommand('isolineAnalyzing', isolineAnalyzing)
    MxFun.addCommand('bufferCalculation', bufferCalculation)

    
    
    // 图层
    MxFun.addCommand('backgroundLayer', backgroundLayer)    
    MxFun.addCommand('customWatermarkBackgroundLayer', customWatermarkBackgroundLayer)    
    MxFun.addCommand('heatmapLayer', heatmapLayer)    
    MxFun.addCommand('radarLayer', radarLayer)
    MxFun.addCommand('skyLayer', skyLayer)
    MxFun.addCommand('webGlLayer', webGlLayer)

    
   
    // 动画
    MxFun.addCommand('circleAnimate', circleAnimate)  
    MxFun.addCommand('annulusAnimation', annulusAnimation)  
    MxFun.addCommand('stretchAnimation', stretchAnimation)  
    MxFun.addCommand('dottedLinePathAnimation', dottedLinePathAnimation)
    MxFun.addCommand('linePatternPathAnimation', linePatternPathAnimation)
    MxFun.addCommand('multiSegmentStretchAnimation', multiSegmentStretchAnimation)
    MxFun.addCommand('iconPathAnimation', iconPathAnimation)
    MxFun.addCommand('customIconAnimation', customIconAnimation)
    MxFun.addCommand('dotSymbolAnimation', dotSymbolAnimation)

    
    // 图形
    MxFun.addCommand('MxCircleTest', MxCircleTest) 
    MxFun.addCommand('MxCurveTest', MxCurveTest) 
    MxFun.addCommand('MxEllipseTest', MxEllipseTest) 
    MxFun.addCommand('drawingNotation', drawingNotation)

    // 点标记
    MxFun.addCommand('apertureOfBreath', apertureOfBreath) 
    MxFun.addCommand('phosphorDot', phosphorDot) 
    MxFun.addCommand('diffusionDot', diffusionDot) 
    MxFun.addCommand('glowingHalo', glowingHalo) 
    MxFun.addCommand('rotatingHalo', rotatingHalo) 
    MxFun.addCommand('rotatedTextBox', rotatedTextBox)     
    MxFun.addCommand('zoomTag', zoomTag)     
    MxFun.addCommand('mapViewDisplayTag', mapViewDisplayTag)     
    MxFun.addCommand('overlapTag', overlapTag)     

    // 点符号聚合
    
    MxFun.addCommand('pointSymbolAggregation', pointSymbolAggregation)     
    MxFun.addCommand('dotSymbolsAggregateCustomIcons', dotSymbolsAggregateCustomIcons)  
    MxFun.addCommand('pointMarkerAggregation', pointMarkerAggregation)     

    

    // 设置标记或弹框高度
    MxFun.addCommand('setHeight', setHeight)     

    

    // 右键菜单
    MxFun.addCommand('rightClickMenu', rightClickMenu) 

    // div
    MxFun.addCommand('DivOverlayTest', DivOverlayTest) 
    MxFun.addCommand('SvgOverlayTest', SvgOverlayTest) 
}