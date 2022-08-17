///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { Map } from "mapbox-gl"
import { LineStringInfoControl as _LineStringInfoControl,  MultiLineInfoControl as _MultiLineInfoControl, BaseEditableInfoControl } from '@wabson/mapbox-gl-feature-info';
import { InfoControlOptions } from "./types";
import * as DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import * as turf from "@turf/turf"
// 绘制的图形的一些信息展示(线)
export class LineStringInfoControl extends _LineStringInfoControl {
    constructor(optios: InfoControlOptions) {
        if(!optios.editActions) optios.editActions  = []
        super(optios);
        // 扩展的功能按钮
        this.editActions.forEach((item:any)=> {
            if(item.title === 'Duplicate line') item.title = '复制'
            if(item.title === 'Add point to line') item.title = '续接'
            if(item.title === 'Split line') item.title = '剪切'
        })
        this.editActions = [
            ...this.editActions,
            // 编辑功能扩展线段切割: 点切/线切/面切 需要初始画drawControl 时加入 splitLineMode 模式
            {
                className: 'mapbox-gl-draw_point',
                title: '点切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'point' })
                }
            },
            {
                className: 'mapbox-gl-draw_line',
                title: '线切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'line_string' })
                }
            },
            {
                className: 'mapbox-gl-draw_polygon',
                title: '面切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'polygon' })
                }
            },
            ...optios.editActions
        ]
    }
    // 添加新的点组成
    onClickAddLinePoint(e:any) {
        e.preventDefault();
        const selected = this.drawControl.getSelected(), mode = this.drawControl.getMode();
        if (selected.features.length !== 1 || selected.features[0].geometry.type !== DrawConstants.geojsonTypes.LINE_STRING) {
            return;
        }
        const selectedLine = selected.features[0];
        this.extendLineString(selectedLine);
    }
    // 添加
    onAdd(map: Map) {
        return super.onAdd(map)
    }
    // 删除
    onRemove() {
        return super.onRemove()
    }

    onClickDuplicateFeature(e:any) {
        e.preventDefault();
        const selected = this.drawControl.getSelected();
        if (selected.features.length !== 1) {
            return;
        }
        const newLine = Object.assign({}, selected.features[0]);
        delete newLine.id;
        const newFeatureIds = this.drawControl.add(newLine);
        this.drawControl.changeMode(
            DrawConstants.modes.SIMPLE_SELECT,
            { featureIds: newFeatureIds }
        );
        this.setFeatures(this.drawControl.getSelected().features);
    }
    isSupportedFeatures(features:any) {
        if(!features) {
            return false
        }
        return features.length == 1 && features[0].geometry && features[0].geometry.type === DrawConstants.geojsonTypes.LINE_STRING;
    }
}
// 绘制的图形的一些信息展示(多线)
export class MultiLineInfoControl extends _MultiLineInfoControl {
    constructor(optios: InfoControlOptions) {
        if(!optios.editActions) optios.editActions  = []
        super(optios);
        // 重写editActions整个扩展过程
        this.editActions = this.editProperties.length ? [{
            className: 'edit-info',
            title: 'Edit feature information',
            handler: this.onClickEditInfo
        }] : [];
        this.editActions = this.editActions.concat([{
            className: 'join-lines',
            title: 'Join lines',
            handler: this.onClickJoinLines
        }]);
        // 当前可扩展的内容
        this.editActions = [
            ...this.editActions,
            // 编辑功能扩展线段切割: 点切/线切/面切 需要初始画drawControl 时加入 splitLineMode 模式
            {
                className: 'mapbox-gl-draw_point',
                title: '点切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'point' })
                }
            },
            {
                className: 'mapbox-gl-draw_line',
                title: '线切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'line_string' })
                }
            },
            {
                className: 'mapbox-gl-draw_polygon',
                title: '面切',
                handler: () => {
                    this.drawControl.changeMode('splitLineMode', { spliter: 'polygon' })
                }
            },
            ...optios.editActions
        ]
    }
    // 重写内部方法
    orderFeaturesByDistanceToAnother() {
        const selectedFeatures = this.drawControl.getSelected().features;
        const coordinates = selectedFeatures.map((feature:any) => feature.geometry.coordinates);
        if(coordinates.length > 1) {
            const joiningDistances = [
                turf.length(turf.lineString([coordinates[0][coordinates[0].length - 1], coordinates[1][0]])),
                turf.length(turf.lineString([coordinates[1][coordinates[1].length - 1], coordinates[0][0]]))
            ];
            return (joiningDistances[0] <= joiningDistances[1] ?
                [ selectedFeatures[0], selectedFeatures[1] ] : [ selectedFeatures[1], selectedFeatures[0] ]);
        }
        
    }
    // 判断是不是多线段
    isSupportedFeatures(features: any) {
        if (!features) {
            return false
        }
        return (features.length == 2 && features.every((feature: any) => feature.geometry && feature.geometry.type === "LineString")) || (features.length == 1) && features[0].geometry && features[0].geometry.type === "MultiLineString";
    }
    onAdd(map: Map) {
        return super.onAdd(map)
    }
    onRemove() {
        return super.onRemove()
    }
}