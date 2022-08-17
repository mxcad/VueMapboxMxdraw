///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { BaseEditableInfoControl } from '@wabson/mapbox-gl-feature-info';
import * as DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import * as turf from "@turf/turf"
import { Popup, Map } from "mapbox-gl";
const DISTANCE_ABBRS: {
    [x: string]: string
} = {
    'miles': 'mi',
    'kilometers': 'km'
};
// 多边形信息展示编辑控件
export class PolygonInfoControl extends BaseEditableInfoControl {
    constructor(options?: any) {
        super(options);
        // 扩展功能
        this.editActions = this.editActions.concat([{
            className: 'duplicate-feature',
            title: '复制',
            handler: this.onClickDuplicateFeature
        },
        {
            className: 'split-line',
            title: '剪切',
            handler: () => {
                this.drawControl.changeMode('cutPolygonMode')
            }
        },
        {   
            className: 'mapbox-gl-draw_line',
            title: "分割",
            handler: ()=> {
                this.drawControl.changeMode('splitPolygonMode');
            }
        },
        {
            className: 'icon-pingjunzhongxin',
            handler: () => {
                const selectedFeatures = this.drawControl.getSelected().features;
                if (!selectedFeatures.length) return;
                let ids: any[] = [];
                let centroids: any[] = [];
                selectedFeatures.forEach((main:any) => {
                    if (main.geometry.type !== 'Polygon') return
                    let centroid = turf.centroid(main.geometry);
                    centroid.id = `${main.id}_centroid_${Math.floor(Math.random() * Math.floor(1000))}`;
                    ids.push(centroid.id)
                    centroids.push(centroid)
                })
                if (centroids.length > 0) {
                    const lnglat = centroids[0].geometry.coordinates
                    lnglat && new Popup().setLngLat(lnglat).setText('多边形平均值质心：' + lnglat.toString()).addTo(this._map)
                    this.drawControl.changeMode('simple_select', { featureIds: ids });
                }

            },
            title: "计算多边形平均值质心"
        }
    ]);
    }
    // 判断是否是多边形
    isSupportedFeatures(features: any) {
        if (!features) {
            return false
        }
        return features.length == 1 && features[0].geometry && features[0].geometry.type === "Polygon";
    }
    // (重写) 点击事件
    onClickDuplicateFeature(e: any) {
        e.preventDefault();
        const selected = this.drawControl.getSelected();
        if (selected.features.length !== 1) {
            return;
        }
        const newLine = Object.assign({}, selected.features[0]);
        delete newLine.id;
        const newFeatureIds = this.drawControl.add(newLine);
        this.drawControl.changeMode(
            'simple_select',
            { featureIds: newFeatureIds }
        );
        this.setFeatures(this.drawControl.getSelected().features);
    }
    // (重写)获取标题
    getFeaturesTitle(this: any, features: any, state = null) {
        let lineDistance = 0, area = 0, title = '';
        if (features.length > 0 && features.every(
            (feature: any) => feature.type === DrawConstants.geojsonTypes.LINE_STRING ||
                feature.type === DrawConstants.geojsonTypes.FEATURE && feature.geometry.type === DrawConstants.geojsonTypes.LINE_STRING
        ) && this.distanceUnits !== 'none') {
            lineDistance = features.reduce((accumulated: number, feature: any) => accumulated + turf.length(feature, { units: this.distanceUnits }), 0);
        }
        if (features.length > 0 && features.every(
            (feature: any) => feature.type === DrawConstants.geojsonTypes.POLYGON ||
                feature.type === DrawConstants.geojsonTypes.FEATURE && feature.geometry.type === DrawConstants.geojsonTypes.POLYGON
        ) && this.distanceUnits !== 'none') {
            area += turf.area(features[0])
        }
        if (features.length === 1) {
            title = this.getFeatureName(features[0], state) || this.defaultTitle;
        } else {
            title = this.defaultTitle;
        }
        if (title !== '' && lineDistance > 0) {
            const unitName = DISTANCE_ABBRS[this.distanceUnits];
            title += ': ' + lineDistance.toLocaleString() + ' ' + unitName;
        }
    
        if (title !== '' && area > 0) {
            title += ': ' + area.toLocaleString() + 'm²'
        }
        return title;
    }
    onAdd(map: Map) {
        return super.onAdd(map)
    }
    onRemove(map: Map) {
        return super.onRemove()
    }
} 