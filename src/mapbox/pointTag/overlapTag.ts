
///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { GeoJSONSource, Marker } from "mapbox-gl"
import { MxMapBox } from "../init"
import * as turf from "@turf/turf"
// 标签重叠解决方案
export function overlapTag() {
    const bounds = MxMapBox.getMap().getBounds().toArray()

    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points = turf.randomPoint(300, { bbox })
    points.features = points.features.map((feature, index)=> {
        feature.properties = {
            id: index,
            cluster: true,
            cluster_id: index
        }
        return feature
    })
    // 利用source的cluster属性解决marker在地图显示重叠的问题
    MxMapBox.getMap().addSource('overlap-tag',{
        type: "geojson",
        data: points,
        cluster: true,
        clusterRadius: 25,
    })

    MxMapBox.getMap().addLayer({
        id: "overlap-tag",
        source: "overlap-tag",
        type: "symbol"
    })
    let markers: { [x: string]: Marker } = {}
    let markersOnScreen: { [x: string]: Marker } = {}
    // 更新markers
    const updateMarkers = ()=> {
        const source = MxMapBox.getMap().getSource('overlap-tag') as GeoJSONSource
        let newMarkers:{ [x: string]: Marker } = {}
        const features = MxMapBox.getMap().querySourceFeatures('overlap-tag')
       
        for(let i = 0; i < features.length;  i++) {
            let coords = (features[i].geometry as any).coordinates as [number, number]
            let props = (features[i] as any)._vectorTileFeature.properties
            let name = ''
            if(!props) continue;
            if(!props.cluster) continue;
            let id = props.cluster_id

            if(id) {
                source.getClusterLeaves(id, 10, 0, (e, f)=> {
                   if(f && f[0] && f[0].properties){
                    name = f[0].properties.name
                   } 
                })
            }else {
                id = props.id
                name = props.name
            }
          
            let marker = markers[id];
           
            if(!marker) {
                if(props.point_count > 1) {
                    marker = markers[id] = new Marker({element: document.createElement('e')}).setLngLat(coords)
                } else {
                    marker = markers[id] = new Marker().setLngLat(coords)
                }
                
               
            }
            newMarkers[id] = marker
            if(markersOnScreen[id])  marker && marker.addTo(MxMapBox.getMap())
            for(id in markersOnScreen) {
                if(!newMarkers[id]) {
                    markersOnScreen[id] && markersOnScreen[id].remove()
                }
            }
            markersOnScreen = newMarkers
        }
    }
    
    // 监听地图数据变化
    MxMapBox.getMap().on('data', (e)=> {
        // 不是这个指定的聚合数据源不操作
        if(e.sourceId !==  'overlap-tag' || !e.isSourceLoaded) return

        // 监听地图移动和移动结束事件并更新markers
        MxMapBox.getMap().on('move', updateMarkers)
        MxMapBox.getMap().on('moveend', updateMarkers)
        updateMarkers()
    })
}