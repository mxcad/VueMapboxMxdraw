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
import mapboxgl from "mapbox-gl";
import { GUI } from "dat.gui";
import { random } from "@/mxthree/utils";

// 栅格图层
export function radarLayer() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0],bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const points:[number, number][] = [
        bounds[0] as [number, number],
        [bounds[1][0], bounds[0][1]],
        
        bounds[1] as  [number, number],
       
        [bounds[0][0], bounds[1][1]],
    ]
    map.addSource('radar', {
        'type': 'image',
        'url': 'https://img2.baidu.com/it/u=2302435858,3031225740&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
        'coordinates': points
    });
    map.addLayer({
        id: 'radar-layer',
        'type': 'raster',
        'source': 'radar',
        'paint': {
            'raster-fade-duration': 0
        }
    });

    const markers = points.map((coordinates)=> {
        return new mapboxgl.Marker({
            color: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`
        }).setLngLat(coordinates as [number, number]).addTo(map).setDraggable(true).on('drag', ()=> {
            updateCoordinates()
        })
    })
    
    function updateCoordinates() {
        const radar =  map.getSource('radar') as mapboxgl.ImageSource
        radar.setCoordinates(markers.map(m => m.getLngLat().toArray()));
    }
    const gui = new GUI()
    let isCheckImg = true
    const guiParams = {
        setImg() {
            const radar =  map.getSource('radar') as mapboxgl.ImageSource
            radar.updateImage({url: isCheckImg ? 'https://img0.baidu.com/it/u=3383374831,3165547532&fm=253&fmt=auto&app=138&f=JPG?w=500&h=312' : 'https://img2.baidu.com/it/u=2302435858,3031225740&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'})
            isCheckImg = !isCheckImg
        }
    }
    gui.add(guiParams, 'setImg').name('切换图片')
    map.once('remove',()=> {
        gui.domElement.remove()
    })
}