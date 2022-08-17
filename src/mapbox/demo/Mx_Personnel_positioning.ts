///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import { MxMapBox} from "../init";
import * as turf from '@turf/turf';
import mapboxgl from "mapbox-gl";
import { GUI } from "dat.gui"
import * as THREE from "three";


// 获取cad图纸中的部分图层数据
async function getMapCadDwgJSON() {
    const data = await fetch('./demo/mapcad.dwg.json')
    return JSON.parse(await data.text());
}

// 加载图片
function loadImg(urls: { [x: string]: string }) {
    let map = MxMapBox.getMap();
    let mxMap = MxMapBox.getMxMap();
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

class Person {
    // 在地图上的位置
    lnglat: [number, number];
    // 人员图标 标记对象
    marker!: mapboxgl.Marker;
    // 方向x，y不同的偏移角度
    dir = [Math.sin(360 * Math.random()), Math.sin(360 * Math.random())]
    // 行走速度
    runSpeed = 1 / 90000
    // 自定义数据
    useData: {
        [x: string]: any
    } = {}
    id: string | number;
    constructor(id: string | number, lnglat: [number, number] = [0, 0]) {
        let map = MxMapBox.getMap();
        this.lnglat = lnglat
        this.id = id
        // 创建人的标记点
        const box = document.createElement('div')
        const img = document.createElement('img')
        img.src = './img/waimainan.png'
        img.style.width = '20px'
        img.style.height = '24px'
        box.appendChild(img)
        this.marker = new mapboxgl.Marker(box).setLngLat(lnglat as mapboxgl.LngLatLike).addTo(map).setPopup(new mapboxgl.Popup().setText(id + '号'))
    }
    // 计算点是否在多边形内
    calculateWhetherThePointIsInsideThePolygon(lnglat: [number, number], scopeOfActivities: any[]) {
        // 表示点的位置
        const pt = turf.point(lnglat)
        let poly: any
        if (scopeOfActivities.length > 1) {
            // 解决'Each LinearRing of a Polygon must have 4 or more Positions.'错误
            poly = turf.multiPolygon(scopeOfActivities);
        } else {
            poly = turf.polygon(scopeOfActivities);
        }
        // 是否在多边形范围内
        return turf.booleanPointInPolygon(pt, poly)
    }
}

export default async function Mx_Personnel_positioning() {

    let map = MxMapBox.getMap();
    let mxMap = MxMapBox.getMxMap();
    // 图纸坐标转地理坐标(经纬度)
    function convertDrawingCoordinatesToGeoCoordinates(pts: THREE.Vector3[] | { x: number, y: number, z?: number }[]) {
        return pts.map((pt) => {
            return mxMap.cadToMercatorCoord(new THREE.Vector3(pt.x, pt.y, pt.z || 0)).toLngLat().toArray()
        })
    }

    const { roadWireFrame, intersectionWireFrame, borderWireFrame, markedPoint } = await getMapCadDwgJSON()
    // 道路的多边形区域的geojson数据
    roadWireFrame.push(roadWireFrame[0])
    const roadGeoJson = turf.polygon([convertDrawingCoordinatesToGeoCoordinates(roadWireFrame)])

    //  道路交叉口的多边形区域的geojson数据
    intersectionWireFrame.push(intersectionWireFrame[0])
    const roadCrossingGeoJson = turf.polygon([convertDrawingCoordinatesToGeoCoordinates(intersectionWireFrame)])

    // 创建线段拉伸
    function createFence3D() {
        const minZoom = map.getMinZoom()
        const maxZoom = map.getMaxZoom()
        //   图纸边框线
        const linesGeoJson = turf.lineStrings([borderWireFrame].map((lines) => {
            return convertDrawingCoordinatesToGeoCoordinates(lines)
        }))

        // 每个缩放级别添加一个图层缓冲数据
        const lineBuffer = turf.buffer(linesGeoJson, 1, {
            units: 'meters'
        });

        map.addSource('lineBufferSource', {
            'type': 'geojson',
            'data': lineBuffer
        });

        map.addLayer({
            'id': 'lineBufferLayer',
            'type': 'fill-extrusion',
            'source': 'lineBufferSource',
            "minzoom": minZoom,
            "maxzoom": maxZoom,
            'paint': {
                'fill-extrusion-vertical-gradient': false, // 控制填充挤出的阴影
                'fill-extrusion-color': '#b8d6f5',
                'fill-extrusion-height': 20,
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 1,

            }
        });

    }

   
    loadImg({
        'img1': '/img/biaoji1.png',
        'img2': '/img/biaoji2.png',
        'img3': '/img/biaoji3.png',
        'img4': '/img/biaoji4.png',
        'img5': '/img/biaoji5.png'
    }).then(() => {
        // 动态更新值的坐标点的数据
        const pointsGeojson = turf.points(convertDrawingCoordinatesToGeoCoordinates(markedPoint))
        pointsGeojson.features.forEach((feature, index) => {
            const iconIndex = index > 4 ? 5 : index + 1
            feature.properties = {
                description: `标记点${index}的值:`,
                icon: "img" + iconIndex,
            }
        })
        // 添加动态数值标记
        map.addLayer({
            "id": "points-1",
            "type": "symbol",
            "source":{
                type: "geojson",
                data: pointsGeojson
            },
            "layout": {
                "icon-image": ['get', 'icon'],
                "icon-size": 1,
                "text-field": ['get', 'description'],
                "text-font": ["Open Sans Semibold"],
                "text-size": 12,
                "text-offset": [0, 1.5],
                "text-anchor": "top",
            },
        }, 'mx.layer.symbol');
 

        const geoJSONSource = map.getSource("points-1") as mapboxgl.GeoJSONSource
      
        const fun = () => {
           
            pointsGeojson.features.forEach((feature:any, index: number) => {
                feature.properties.description ="标记点" + index + "的值:" + Math.random().toFixed(2)
            })
            geoJSONSource.setData(pointsGeojson)
           
        }
        guiParims.intervalId = setInterval(fun, 2000)
        gui.add(guiParims, 'isChangeValue').name('数值变化').onChange((is) => {
            is ? (guiParims.intervalId = setInterval(fun, 2000)) : clearInterval(guiParims.intervalId)
        })
        gui.add(guiParims, 'isShowDynamicTag').name('图标显示隐藏').onChange(is => {
            map.setLayoutProperty("points-1", "visibility", is ? "visible" : "none");
        })
    })

    // 创建人员
    function createPerson(lnglat: [number, number], id: number | string) {
        // 点的标记
        const person = new Person(id, lnglat)
        // 是否在路段范围内
        person.useData.whetherItIsWithinTheRoadSection = person.calculateWhetherThePointIsInsideThePolygon(lnglat, roadGeoJson.geometry.coordinates)
        // 是否在交叉路口
        person.useData.isItAtAnIntersection = person.calculateWhetherThePointIsInsideThePolygon(lnglat, roadCrossingGeoJson.geometry.coordinates)
        return person
    }

    //  人员的初始位置
    let lnglats: [number, number][] = [
        [116.38721368976792, 39.90895887734885],
        [116.38755759657698, 39.90911537474369],
        [116.38728253472476, 39.909046874017434],
        [116.38666052904449, 39.90351283569427],
        [116.38671546568116, 39.903204523405265],
        [116.3872127867993, 39.90280304992808],
        [116.38738977737233, 39.90484641880309],
        [116.3880853509587, 39.903329350910866],
        [116.38729101891363, 39.90497161526105],
        [116.3896933890041, 39.90336650664776]
    ]

    // 表示人员的对象集合
    let markers: Person[]

    // 当人员在交叉路口时时弹出HTML对话框
    let popup: mapboxgl.Popup

    const gui = new GUI()

    const zoom = map.getZoom()
    const guiParims: {
        [x: string]: any
    } = {
        isShowPersonnelLocation: true,
        isChangeValue: false,
        isShowDynamicTag: true,
        isCreateFence3D: false,
        personnelIndex: -1,
    }

    //  添加标识路段的图层
    map.addLayer({
        'id': 'road',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': roadGeoJson
        },
        'layout': {
        },
        'paint': {
            'fill-color': '#48a164',
            'fill-opacity': 0.5
        }
    }, 'mx.layer.fill')

    // 添加标识交叉路口的图层
    map.addLayer({
        'id': 'intersection',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': roadCrossingGeoJson
        },
        'layout': {
        },
        'paint': {
            'fill-color': '#ff0000',
            'fill-opacity': 0.5
        }
    }, 'mx.layer.fill')

    // 人员移动的图层
    map.addLayer({
        id: "personnel_movement_layer",
        type: 'custom',
        renderingMode: '3d',
        async onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
            markers = lnglats.map((v, i) => {
                return createPerson(v, i);
            })
            map.triggerRepaint()
        },
        render(gl: WebGLRenderingContext, matrix: number[]) {
            if (!markers) return
            markers.forEach((obj) => {
                //   保存当前位置
                let x = obj.lnglat[0] + 0
                let y = obj.lnglat[1] + 0
                // 人员位置改变 模拟人员走动，随机运动  
                obj.useData.whetherItIsWithinTheRoadSection ? (obj.lnglat[0] += obj.runSpeed * obj.dir[0], obj.lnglat[1] -= obj.runSpeed * obj.dir[1]) : (obj.lnglat[0] += obj.runSpeed * obj.dir[0], obj.lnglat[1] -= obj.runSpeed * obj.dir[1])

                // 人员位置是否在路段范围内
                obj.useData.whetherItIsWithinTheRoadSection = obj.calculateWhetherThePointIsInsideThePolygon(obj.lnglat, roadGeoJson.geometry.coordinates)
                if (!obj.useData.whetherItIsWithinTheRoadSection) {
                    obj.lnglat = [x, y]
                    obj.dir = [Math.sin(360 * Math.random()), Math.sin(360 * Math.random())]
                }
                // 人员是否在交叉路口, 设置颜色进行区分
                obj.useData.isItAtAnIntersection = obj.calculateWhetherThePointIsInsideThePolygon(obj.lnglat, roadCrossingGeoJson.geometry.coordinates)
                // 移动标记点
                obj.marker.setLngLat(obj.lnglat as mapboxgl.LngLatLike)
            })

            // 如果有人员正在交叉路径经过
            if (markers.some(v => v.useData.isItAtAnIntersection)) {
                if (!popup) {
                    popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false }).setText(`有人进入交叉路口...`).addTo(map).setLngLat([116.38699130003107, 39.90369033211135])
                    popup.addClassName('mx_popup')
                } else {
                    popup.removeClassName('none')
                    popup.addClassName('flex')
                }
                map.setPaintProperty('intersection', 'fill-color', '#ff0000');
            } else {
                popup && popup.removeClassName('flex')
                popup && popup.addClassName('none')
                map.setPaintProperty('intersection', 'fill-color', '#fff');
            }
        }
    }, 'mx.layer.symbol')




   



    gui.add(guiParims, 'isShowPersonnelLocation').name("人员显示隐藏").onChange((is) => {
        markers && markers.forEach(({ marker }) => {
            marker.getElement().style.display = is ? 'block' : 'none'
        })
    })

    gui.add(guiParims, 'isCreateFence3D').name('3d').onChange((is) => {
        const layer = map.getLayer('lineBufferLayer')
        if (!layer && is) {
            createFence3D()
        } else {
            map.setLayoutProperty("lineBufferLayer", "visibility", is ? "visible" : "none");
        }
    })

    // 添加人员定位效果
    let runbox: HTMLDivElement
    let timeoutId: NodeJS.Timeout
    let marker: mapboxgl.Marker
    function addPositioningPersonnel(index: number) {
        if (!markers[index]) return
        clearTimeout(timeoutId)
        runbox && runbox.remove()
        if (marker) {
            const popup = marker.getPopup()
            popup && popup.remove()
        }
        // 设置动画光圈效果
        marker = markers[index].marker
        marker.setPopup(new mapboxgl.Popup().setText(index + "号").addTo(map))
        const lngLat = marker.getLngLat()
        const el = marker.getElement()
        runbox = document.createElement('div')
        runbox.style.transform = `translate(-50%, -50%) rotateX(${map.getPitch()}deg) rotateZ(0deg)`
        runbox.className = 'run'
        el.appendChild(runbox)
        const mouseup = () => {
            runbox.style.transform = `translate(-50%, -50%) rotateX(${map.getPitch()}deg) rotateZ(0deg)`
        }
        map.on('mouseup', mouseup)
        timeoutId = setTimeout(() => {
            runbox.remove()
            map.off('mouseup', mouseup)
        }, 6000)
        map.setZoom(zoom + 2)
        map.setCenter(lngLat)
    }
    gui.add(guiParims, 'personnelIndex', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).name("人员定位").onChange((index) => {
        addPositioningPersonnel(index)
    })

    map.on('click', function (e) {
        const features = map.queryRenderedFeatures(e.point);
        if (features[0] && features[0].layer && features[0].layer.id === 'points-1') {
            const geometry = features[0].geometry as any
            const { description, icon } = features[0].properties as any
            const pt = geometry.coordinates
            if (description && icon && pt) {
                new mapboxgl.Popup()
                    .setLngLat(pt)
                    .setHTML('<p>' + description + icon + '</p>')
                    .addTo(map)
            }
        }
    });
    map.once('remove', () => {
        gui.domElement.remove()
        clearInterval(guiParims.intervalId)
    })
}