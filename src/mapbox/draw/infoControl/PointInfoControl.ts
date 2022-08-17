///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { Map } from "mapbox-gl"
import { PointInfoControl as _PointInfoControl } from '@wabson/mapbox-gl-feature-info';
import { InfoControlOptions } from "./types";
// 绘制的图形的一些信息展示控件(点)
export class PointInfoControl extends _PointInfoControl {
    constructor(optios: InfoControlOptions) {
        if(!optios.editActions) optios.editActions  = []
        super(optios);
        this.editActions = [
            ...this.editActions,
            ...optios.editActions
        ]
    }
    
    // 判断这个图形是不是点
    isSupportedFeatures(features: any) {
        if (!features) {
            return false
        }
        return features.length == 1 && features[0].geometry && features[0].geometry.type === 'Point' && features[0].properties._type !== 'text';
    }
    // 添加
    onAdd(map: Map) {
        return super.onAdd(map)
    }
    // 删除
    onRemove() {
        return super.onRemove()
    }
}