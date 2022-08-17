///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { MxMapBox } from "../init";
import * as turf from "@turf/turf"
import mapboxgl from "mapbox-gl"
import { random } from "@/mxthree/utils";


// 点标记Marker聚合(聚合通过Symbol绘制)
export function pointMarkerAggregation() {
    let map = MxMapBox.getMap();
    
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const geoJsonData = turf.randomPoint(500, { bbox })
    geoJsonData.features = geoJsonData.features.map((feature, index)=> {
        feature.id = index
        feature.properties = {
            index,
            color: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}`
        }
        return feature
    })

    // 添加聚合数据源
    let sourceId = 'pointMarkerAggregation-points';

    map.addSource(sourceId, {
        type: 'geojson',
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 20, 
        clusterRadius: 60
    });

    //添加聚合图层
    let outerColors = [
        [1000, 'rgba(253, 156, 115, 0.6)'],
        [100, 'rgba(241, 211, 87, 0.6)'],
        [0, 'rgba(181, 226, 140, 0.6)']
    ];
    // 添加绘制聚合圈的图层
    outerColors.forEach(function (color, i) {
        map.addLayer({
            "id": "point-outer-cluster-" + i,
            "type": "circle",
            "source": sourceId,
            "paint": {
                "circle-color": color[1] as string,
                "circle-radius": 20
            },
            "filter": i === 0 ?
                [">=", "point_count", color[0]]:
                ["all",
                    [">=", "point_count", color[0]],
                    ["<", "point_count", outerColors[i - 1][0]]
                ],
        });
    });


    let innerColors = [
        [1000, 'rgba(241, 128, 23, 0.6)'],
        [100, 'rgba(240, 194, 12, 0.6)'],
        [0, 'rgba(110, 204, 57, 0.6)']
    ];
    innerColors.forEach(function (color, i) {
        map.addLayer({
            "id": "point-inner-cluster-" + i,
            "type": "circle",
            "source": sourceId,
            "paint": {
                "circle-color": color[1] as string,
                "circle-radius": 15
            },
            "filter": i === 0 ?
                [">=", "point_count", color[0]]:
                ["all",
                    [">=", "point_count", color[0]],
                    ["<", "point_count", innerColors[i - 1][0]]
                ]
        });
    });
    // 添加聚合数量
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Semibold'],
            'text-size': 12
        }
    });

    const markers = {} as any;
    let markersOnScreen = {} as any;

    function updateMarkers() {
        const newMarkers = {} as any;
        const features = map.querySourceFeatures(sourceId) as any;

        for (const feature of features) {
            const coords = feature.geometry.coordinates;
            const props = feature.properties;
            if (props.point_count > 0) continue;
            const id = props.index;
            let marker = markers[id];
            if (!marker) {
                marker = markers[id] = new mapboxgl.Marker({
                    color: props.color
                }).setLngLat(coords);
                // 把属性数据加进marker里面
                marker.props = {...props}
                let popup = new mapboxgl.Popup({
                    offset: [0, -32]
                })
                .setHTML(`第 ${id} 个点`)
                marker.setPopup(popup)
            }
            newMarkers[id] = marker;

            if (!markersOnScreen[id]) {
                marker.addTo(map);
            }
        }
        // 移除已经隐藏的
        for (const id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    }

    // 在数据加载完成后，每帧刷新时候更新
    map.on('render', () => {
        if (!map.isSourceLoaded(sourceId)) return;
        updateMarkers();
    });

    // 给每个聚合圈绑定点击事件
    for(let i = 0; i < outerColors.length; i++) {
        let clusterLayer = "point-outer-cluster-" + i;
        map.on('click', clusterLayer, e => {
            let features = map.queryRenderedFeatures(e.point, {
                layers: [clusterLayer]
            }) as any
            let clusterId = features[0].properties.cluster_id;
            (map.getSource(sourceId) as any).getClusterExpansionZoom(
                clusterId,
                function (err:any, zoom:number) {
                    if (err) return;
                    // 地图中心点和缩放改变
                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });
        // 鼠标样式切换
        map.on('mouseenter', clusterLayer, e => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', clusterLayer, e => {
            map.getCanvas().style.cursor = '';
        });
    }
    
}