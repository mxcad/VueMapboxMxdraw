///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import * as constants from '@mapbox/mapbox-gl-draw/src/constants';
import MapboxGlDraw from '@mapbox/mapbox-gl-draw';
import { Map } from  'mapbox-gl'
import Record from './Record';
import History from './History'
// 创建一个历史记录的管理器
const history = new History()

// 事件类型
const eventsType = {
    [constants.events.DELETE]: 1,
    [constants.events.UPDATE]: 2,
    [constants.events.CREATE]: 3,
    [constants.events.REPLACE]: 4
};

// 事件动作
const eventsAction = {
    [constants.updateActions.MOVE]: 1,
    [constants.updateActions.CHANGE_COORDINATES]: 2,
    [constants.updateActions.CHANGE_PROPERTIES]: 3
};



let ctx = {
    type: eventsType,
    action: eventsAction
};

// 绘制的历史记录管理
export default function (draw:MapboxGlDraw, map: Map) {
    // 获取控制器
    const container = map.getContainer()
    let api: { undoHistory: any; redoHistory: any; addEventListeners: () => void; removeEventListeners: () => void; };
    // 事件API
    const eventsApi = Object.assign({}, {
        onDrawCreate: function (evt:any) {
            const record = new Record(3, 0, evt.features);
            history.addRecord(record);
        },
        onDrawUpdate: function (evt:any) {
            const record = new Record(2, ctx.action[evt.action] || 0, evt.features, evt.prevFeatures);
            history.addRecord(record);
        },
        onDrawDelete: function (evt:any) {
            const record = new Record(1, 0, evt.features);
            history.addRecord(record);
        },
        onDrawCombine: function (evt:any) {
            const record = new Record(4, 0, evt.createdFeatures, evt.deletedFeatures);
            history.addRecord(record);
        },
        onDrawUncombine: function (evt:any) {
            const record = new Record(4, 0, evt.createdFeatures, evt.deletedFeatures);
            history.addRecord(record);
        },
        onDrawReplace: function (evt:any) {
            const record = new Record(4, 0, evt.createdFeatures, evt.deletedFeatures);
            history.addRecord(record);
        },
        onKeydown: function (evt:any) {
            if (evt.keyCode === 90) {
                evt.preventDefault();
                api.undoHistory();
            } else if (evt.keyCode === 89) {
                evt.preventDefault();
                api.redoHistory();
            }
        }
    });

    api = {
        // 添加事件(mapbox-draw 绘制控件的一些绘制事件)
        addEventListeners: function () {
            if (!map) return;
            map.on(constants.events.CREATE, eventsApi.onDrawCreate);
            map.on(constants.events.UPDATE, eventsApi.onDrawUpdate);
            map.on(constants.events.DELETE, eventsApi.onDrawDelete);
            map.on(constants.events.COMBINE_FEATURES, eventsApi.onDrawCombine);
            map.on(constants.events.UNCOMBINE_FEATURES, eventsApi.onDrawUncombine);
            map.on(constants.events.REPLACE, eventsApi.onDrawReplace);
        },
        // 移除事件
        removeEventListeners: function () {
            if (!map) return;
            map.off(constants.events.CREATE, eventsApi.onDrawCreate);
            map.off(constants.events.UPDATE, eventsApi.onDrawUpdate);
            map.off(constants.events.DELETE, eventsApi.onDrawDelete);
            map.off(constants.events.COMBINE_FEATURES, eventsApi.onDrawCombine);
            map.off(constants.events.UNCOMBINE_FEATURES, eventsApi.onDrawUncombine);
            map.off(constants.events.REPLACE, eventsApi.onDrawReplace);
            container.removeEventListener('keydown', eventsApi.onKeydown);
        },
        // 撤销历史
        undoHistory: function () {
            if (draw && history) {
                // 取消记录
                const record = history.undoRecord();
                if (record) {
                    // 记录的类型
                    const type = record.getType();
                    // 绘制图形的数据
                    const features = record.getFeatures();
                    const prevFeatures = record.getPrevFeatures();
                    switch (type) {
                        case 1:

                            if (features.length > 0) {
                                features.map(feature => {
                                    draw.add(Object.assign({}, feature, {
                                        type: feature.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = features.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        case 2:

                            if (features.length > 0) {
                                const featureIds = features.map(f => f.id);
                                draw.delete(featureIds);
                            }
                            if (prevFeatures.length > 0) {
                                prevFeatures.map(pf => {
                                    draw.add(Object.assign({}, pf, {
                                        type: pf.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = prevFeatures.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        case 3:
                            if (features.length > 0) {
                                const featureIds = features.map(f => f.id);
                                draw.delete(featureIds);
                            }
                            break;
                        case 4:
                            if (features.length > 0) {
                                const featureIds = features.map(f => f.id);
                                draw.delete(featureIds);
                            }

                            if (prevFeatures.length > 0) {
                                prevFeatures.map(f => {
                                    draw.add(Object.assign({}, f, {
                                        type: f.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = prevFeatures.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        redoHistory: function () {
            if (draw && history) {
                const record = history.redoRecord();
                if (record) {
                    draw.getAll();
                    const type = record.getType();

                    const features = record.getFeatures();
                    const prevFeatures = record.getPrevFeatures();
                    switch (type) {
                        case 3:
                            if (features.length > 0) {
                                features.map(f => {
                                    draw.add(Object.assign({}, f, {
                                        type: f.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = features.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        case 2:
                            if (prevFeatures.length > 0) {
                                const featureIds = prevFeatures.map(f => f.id);
                                draw.delete(featureIds);
                            }
                            if (features.length > 0) {
                                features.map(f => {
                                    draw.add(Object.assign({}, f, {
                                        type: f.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = features.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        case 1:
                            if (features.length > 0) {
                                const featureIds = features.map(f => f.id);
                                draw.delete(featureIds);
                            }
                            break;
                        case 4:
                            if (prevFeatures.length > 0) {
                                const featureIds = prevFeatures.map(f => f.id);
                                draw.delete(featureIds);
                            }
                            if (features.length > 0) {
                                features.map(f => {
                                    draw.add(Object.assign({}, f, {
                                        type: f.type || constants.geojsonTypes.FEATURE
                                    }));
                                });
                                const featureIds = features.map(f => f.id);
                                draw.changeMode(constants.modes.SIMPLE_SELECT, { featureIds });
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    };

    return api;
}