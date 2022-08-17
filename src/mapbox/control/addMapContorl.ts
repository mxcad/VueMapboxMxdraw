///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////



import { GUI } from "dat.gui";
import { AttributionControl, FullscreenControl, IControl, NavigationControl, ScaleControl } from "mapbox-gl";
import { MxMapBox } from "../init";


// 地图控件增加与移除
export function addMapContorl() {

    let map = MxMapBox.getMap();
    let scaleControl: IControl | null = null;
    const showHideScaleControl = () => {
        if (!scaleControl) {
            scaleControl = new ScaleControl()
            map.addControl(scaleControl, "bottom-left");
        } else {
            map.removeControl(scaleControl);
            scaleControl = null;
        }
    }

    let navigationControl: IControl | null = null;
    const showHideNavigationControl = () => {
        if (!navigationControl) {
            navigationControl = new NavigationControl();
            map.addControl(navigationControl, "top-right");
        } else {
            map.removeControl(navigationControl);
            navigationControl = null;
        }
    }
    let fullScreenControl: IControl | null = null;
    const showHideFullScreenControl = () => {
        if (!fullScreenControl) {
            fullScreenControl = new FullscreenControl();
            map.addControl(fullScreenControl, "bottom-right");
        } else {
            map.removeControl(fullScreenControl);
            fullScreenControl = null;
        }
    }
    let attributionControl: IControl | null = null
    const showAttributionControl = () => {
        if (!attributionControl) {
            attributionControl = new AttributionControl({
                compact: true,
                customAttribution: "map属性"
            });
            map.addControl(attributionControl, "top-left");
        } else {
            map.removeControl(attributionControl);
            fullScreenControl = null;
        }
    }

    let geolocateControl: IControl | null = null
    const showGeolocateControl = ()=> {
        if (!geolocateControl) {
            geolocateControl = new AttributionControl();
            map.addControl(geolocateControl, "bottom-right");
        } else {
            map.removeControl(geolocateControl);
            fullScreenControl = null;
        }
    }

    // 控件显示隐藏
    const gui = new GUI()
    const guiParims = {
        showHideScaleControl,
        showHideNavigationControl,
        showHideFullScreenControl,
        showAttributionControl,
        showGeolocateControl
    }
    gui.add(guiParims, 'showHideScaleControl').name('比例尺')
    gui.add(guiParims, 'showHideNavigationControl').name('指南针')
    gui.add(guiParims, 'showHideFullScreenControl').name('全屏')
    gui.add(guiParims, 'showAttributionControl').name('属性')
    map.once('remove',()=> {
        gui.domElement.remove()
    })
}

