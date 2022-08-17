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
// 点符号聚合
export function pointSymbolAggregation() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 根据地图范围生成随机点
    const geoJsonData = turf.randomPoint(5000, { bbox })
    geoJsonData.features = geoJsonData.features.map((feature, index)=> {
        feature.id = index
        feature.properties = {
            index
        }
        return feature
    })

    // 添加聚合源
    map.addSource('test-points', {
        type: 'geojson',
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 20,
        clusterRadius: 60
    });

    // 添加聚合圈
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'test-points',
        filter: ['has', 'point_count'], // 只有带有point_counts属性的才显示
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'], // 值默认为'#57FF8C' 大于100时为'#FFA0FD' 大于1000为'#FF420E'
                '#57FF8C',
                100,
                '#FFA0FD',
                1000,
                '#FF420E'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'], // 控制圆的大小半径
                20,
                100,
                30,
                1000,
                40
            ]
        }
    });
    // 添加聚合数量
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'test-points',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}', // 显示文字（聚合圈包含多少个点）
            'text-font': ["Open Sans Semibold"],
            'text-size': 12
        }
    });

    // 添加原始点数据
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'test-points',
        filter: ['!', ['has', 'point_count']], // 不是聚合圆（就是原点）
        paint: {
            'circle-color': '#0ef7ff',
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#007b7b'
        }
    });
    
    map.on('click', 'clusters', function (e) {
        let features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        }) as any
        let clusterId = features[0].properties.cluster_id;
        // 通过clusterId 找到其对应的缩放级别
        (map.getSource('test-points') as any).getClusterExpansionZoom(
            clusterId,
            function (err:any, zoom:number) {
                if (err) return;
    
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });
    
    // 原始点点击事件
    map.on('click', 'unclustered-point', function (e:any) {
        let coordinates = e.features[0].geometry.coordinates.slice();
        let index = e.features[0].properties.index;
    
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`第 ${index} 个点`)
            .addTo(map);
    });
    
    // 切换鼠标样式
    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
    });
}