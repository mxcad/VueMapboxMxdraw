///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import mapboxgl from "mapbox-gl";
import { MxMapBox } from "../init";
import { MxCircle } from "../graphics/MxCircle";
import * as turf from "@turf/turf";
let menuPopup: mapboxgl.Popup

// 右键菜单
class RightClickMenu extends mapboxgl.Popup {
    
    constructor(options: mapboxgl.PopupOptions & { items: any, lngLat: any }) {
        let map = MxMapBox.getMap();
        // 已经存在右键菜单就删除掉
        menuPopup && menuPopup.remove()
        super(options);
        menuPopup = this
        // 创建列表
        const _ul = document.createElement('ul')
        _ul.className = 'right-clikc-menu'
        // 根据提供的参数生成不同类型的item
        this.createItmeEl(options.items, _ul)
        // 设置DOM
        menuPopup.setDOMContent(_ul)
        // 设置位置
        menuPopup.setLngLat(options.lngLat)
        menuPopup.addTo(map)
        const popupEl = menuPopup.getElement()
        // 调整样式
        const popupElContent = popupEl.children[1] as HTMLElement
        const popupElTip = popupEl.children[0] as HTMLElement
        popupElContent.style.backgroundColor = "#252526"
        popupElContent.style.padding = "3px"
        popupElTip.style.display = 'none'


    }
    createItmeEl(items: any, el: HTMLElement) {

        items.forEach((item: any) => {

            let li = document.createElement('li')
            li.classList.add('right-clikc-menu-li')
            let ul: HTMLElement;
            switch (item.type) {
                // 自定义类型，可以是任何HTML字符串
                case 'custom':
                    li.classList.add('menu-imte-custom')
                    li.innerHTML = item.markup
                    break;
                // 分割线
                case 'seperator':
                    li.className = 'seperator'
                    break;
                // 鼠标触摸弹出子菜单 
                case 'hovermenu':
                    li.classList.add('hover-menu-itme')
                    li.innerText = item.label
                    ul = document.createElement('ul')
                    ul.className = 'hover-menu-box'
                    li.appendChild(ul)
                    // 生成子菜单列表
                    if (item.items) this.createItmeEl(item.items, ul);
                    break;
                case 'submenu':
                    // 收缩的子菜单列表
                    li.className = 'menu-submenu'
                    const div = document.createElement('div')
                    div.innerText = item.label
                    div.className = 'right-clikc-menu-li'
                    li.appendChild(div)
                    ul = document.createElement('ul')
                    ul.className = 'submenu-box submenu-box-hidden'
                    li.appendChild(ul);
                    
                    li.onclick = (e) => {
                        e.preventDefault()
                        if (ul.className.indexOf('submenu-box-hidden') >= 0) {
                            ul.classList.remove('submenu-box-hidden')
                        } else {
                            ul.classList.add('submenu-box-hidden')
                            
                        }
                    }
                    if (item.items) this.createItmeEl(item.items, ul);

                    break;
                case 'multi':
                    // 横向tab子菜单
                    li.className = 'menu-itme-multi'
                    if (item.items) item.items.forEach((item1: any) => {
                        const _li = document.createElement('li')
                        _li.className = "menu-itme-multi-li right-clikc-menu-li"
                        _li.onclick = (e) => { item1.onClick(event); menuPopup.remove() }
                        _li.innerText = item1.label
                        li.appendChild(_li)
                    })
                    break;
                default:
                    // 普通的按钮
                    li.classList.add('menu-itme')
                    li.innerText = item.label
                    break;
            }
            if (item.onClick) li.onclick = (e) => { item.onClick(event); menuPopup.remove() }
            el.appendChild(li)
        })
    }
}

// 右键菜单
export function rightClickMenu() {
    let map = MxMapBox.getMap();
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    // 根据地图范围随机生成点数据
    const points = turf.randomPoint(5, { bbox })
    let dots: mapboxgl.Marker[] = []
    // 图形
    const mxCircles = points.features.map((point) => {
        dots.push(new mapboxgl.Marker().setLngLat(point.geometry.coordinates as [number, number]).addTo(map))
        return new MxCircle({
            type: "fill",
            isExtrusion: false,
            center: point.geometry.coordinates
        }).addTo(map)
    });

    // 标记点
    const points1 = turf.randomPoint(5, { bbox })
    points1.features.map((point) => {
        dots.push(new mapboxgl.Marker().setLngLat(point.geometry.coordinates as [number, number]).addTo(map))
    });
    // 添加标记点监听右键事件
    dots.forEach((dot)=> {
        dot.getElement().addEventListener('mouseup', (e)=> {
            if (e.button != 2) return;//不是右键
            e.preventDefault();
            e.stopPropagation();
            // 标记右键 得到一个新的有右键菜单
            new RightClickMenu({
                lngLat: map.unproject(new mapboxgl.Point(e.x - 125,e.y)) ,
                items: [
                    {type: 'custom', markup: `<span style="color: #ffff00; padding-left: 30px">我是标注Marker的右键菜单</span>`},
                    {
                        label: '获取此Marker的信息',
                        onClick: () => {
                            alert(`当前MarkerId为 ${dot.getLngLat().toString()}`);
                        }
                    }
                ]
            });
        })
    })
    // 地图鼠标右键
    map.on('contextmenu', (event) => {
        const id = mxCircles[0]._getSourceOrLayerId(mxCircles[0].options)
        // 查询这个点上是否有图形
        let features = map.queryRenderedFeatures(event.point, { layers: [id] }) as any
        if (features.length > 0) {
            // 图形右键 
            new RightClickMenu({
                items: [
                    { type: 'custom', markup: `<span style="color: #ffff00; padding-left: 30px">我是圆图层的右键菜单</span>` },
                    {
                        label: '查看选择的多边形信息',
                        onClick: () => {
                            alert(`当前多边形ID: ${features[0].id}, 当前多边形颜色: ${features[0].properties.color}`)
                        }
                    },
                    {
                        label: '删除',
                        onClick: () => {
                            
                            const item = mxCircles.filter((mxCircle)=> {
                                return mxCircle.id === features[0].id
                            })[0]
                            console.log(item)
                            if(item) item.remove()

                        }
                    }
                ],
                // 位置
                lngLat: event.lngLat
            })
            return

        }
        // 地图右键
        new RightClickMenu({
            items: [
                { type: 'custom', markup: `<span style="color: #ffff00; padding-left: 30px">菜单右键功能演示</span>` },
                {
                    type: 'multi', items: [
                        { label: '不旋转', onClick: () => { map.setBearing(0); } },
                        { label: '不倾斜', onClick: () => { map.setPitch(0); } },
                    ]
                },
                {
                    label: '获取此位置的坐标', onClick: (e: any) => {

                        console.log(e.lngLat)
                    }
                },
                { type: 'seperator' },
                {
                    type: 'submenu', label: '地图缩放', items: [
                        { label: '放大一级', onClick: () => { map.setZoom(map.getZoom() + 1) } },
                        { label: '缩小一级', onClick: () => { map.setZoom(map.getZoom() - 1) }, enabled: map.getZoom() - 1 > 0 },
                        { label: '缩小至最小级', onClick: () => { map.setZoom(0) } },
                        {
                            label: '飞行至此位置', onClick: () => {
                                map.flyTo({
                                    center: event.lngLat,
                                    pitch: 60,
                                    zoom: 18
                                })
                            }
                        }
                    ]
                },
                {
                    type: 'hovermenu', label: '地图设置', items: [
                        {
                            label: '双击鼠标进行缩放',
                            onClick: () => {
                                if (map.doubleClickZoom.isEnabled()) {
                                    map.doubleClickZoom.disable()
                                } else {
                                    map.doubleClickZoom.enable()
                                }
                            }
                        },
                        {
                            label: '允许地图旋转',

                            onClick: () => {
                                if (map.dragRotate.isEnabled()) {
                                    map.dragRotate.disable();
                                } else {
                                    map.dragRotate.enable();
                                }
                            }
                        },
                        {
                            label: '允许地图倾斜',
                            onClick: () => {
                                if (map.getMaxPitch() == 0) {
                                    map.setMaxPitch(85)
                                } else {
                                    map.setMaxPitch(0)
                                }
                            }
                        }
                    ]
                }
            ],
            lngLat: event.lngLat
        })

    });
}