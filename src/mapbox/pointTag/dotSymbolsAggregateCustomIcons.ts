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

// 加载图片
function loadImg(urls: { [x: string]: string }) {
    let map = MxMapBox.getMap();
    const ps: any[] = []
    for (let key in urls) {
        const url = urls[key]
        ps.push(
            new Promise((res, rej) => {
                map.loadImage(url, function (error, image: any) {
                    if (error) {
                        rej(error)
                        return
                    }
                    map.addImage(key, image);
                    res(image)
                })
            })
        )
    }
    return Promise.allSettled(ps)
}


// 聚合自定义图标
export async function dotSymbolsAggregateCustomIcons() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const geoJsonData = turf.randomPoint(5000, { bbox })
    geoJsonData.features = geoJsonData.features.map((feature, index)=> {
        feature.properties = {
          icon: "icon" + index % 5,
          index
        }
        return feature
    })

    await loadImg({
        'icon0': '/img/biaoji1.png',
        'icon1': '/img/biaoji2.png',
        'icon2': '/img/biaoji3.png',
        'icon3': '/img/biaoji4.png',
        'icon4': '/img/biaoji5.png'
    })
    map.addSource('icons-test-points', {
        type: 'geojson',
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 20,
        clusterRadius: 60
    });


    //添加聚合图层
    // 外面的圆
    let outerColors = [[1000, 'rgba(253, 156, 115, 0.6)'], [100, 'rgba(241, 211, 87, 0.6)'], [0, 'rgba(181, 226, 140, 0.6)']];
    outerColors.forEach((color, i) => {
        map.addLayer({
            "id": "point-outer-cluster-" + i,
            "type": "circle",
            "source": "icons-test-points",
            "paint": {
                "circle-color": color[1] as string,
                "circle-radius": 20
            },
            "filter": i === 0 ?
                [">=", "point_count", color[0]] :
                ["all", [">=", "point_count", color[0]], ["<", "point_count", outerColors[i - 1][0]]]
        });
    });

    // 里面的圆
    let innerColors = [[1000, 'rgba(241, 128, 23, 0.6)'], [100, 'rgba(240, 194, 12, 0.6)'], [0, 'rgba(110, 204, 57, 0.6)']];
    innerColors.forEach(function (color, i) {
        map.addLayer({
            "id": "point-inner-cluster-" + i,
            "type": "circle",
            "source": "icons-test-points",
            "paint": {
                "circle-color": color[1] as string,
                "circle-radius": 15
            },
            "filter": i === 0 ?
                [">=", "point_count", color[0]] :
                ["all", [">=", "point_count", color[0]], ["<", "point_count", innerColors[i - 1][0]]]
        });
    });

    // 显示聚合数量
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'icons-test-points',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Semibold'],
            'text-size': 12
        }
    });

    // 显示自定义图标下面的文字
    map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'icons-test-points',
        filter: ['!', ['has', 'point_count']],
        paint: { 
            "text-color": "#FFA0FD"
        },
        layout: {
            "icon-image": ['get', 'icon'],
            "icon-offset": [0, -17],
            "text-field": ["get", "index"],
            "text-font": ['Open Sans Semibold'],
            "text-size": 14,
            "text-offset": [0, 0],
            "text-anchor": "top",
            "icon-allow-overlap": false, 
            "text-allow-overlap": false 
        }
    });
    for(let i = 0; i < outerColors.length; i++) {
        let clusterLayer = "point-outer-cluster-" + i;
        // 点击聚合圈 地图调整对应缩放等级
        map.on('click', clusterLayer, e => {
            let features = map.queryRenderedFeatures(e.point, {
                layers: [clusterLayer]
            }) as any;
            let clusterId = features[0].properties.cluster_id;
            (map.getSource('icons-test-points') as any).getClusterExpansionZoom(
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
    
    
    
        // 切换鼠标手势
        map.on('mouseenter', clusterLayer, e => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', clusterLayer, e => {
            map.getCanvas().style.cursor = '';
        });
    }
    // 点击自定义图标显示弹框
    map.on('click', 'unclustered-point', function (e: any) {
        let coordinates = e.features[0].geometry.coordinates.slice();
        let index = e.features[0].properties.index;
    
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`第 ${index} 个点`)
        .addTo(map);
    });
    
    // 改名鼠标样式
    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
    });
}