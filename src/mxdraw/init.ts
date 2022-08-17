///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as THREE from "three";
import { MxFun, loadCoreCode, store, MxDrawObject } from "mxdraw";
import { cmdInit } from "./cmdInit";
import { Map } from "@/mapbox/Map";
import { animateRun, animateStop } from "@/mapbox/animate";
import resourceTracker from "./ResourceTracker";

// 用于追踪清理three.js资源的方法
const track = resourceTracker.track.bind(resourceTracker)
// three资源追踪
function tracks(obj:any) {
  if(obj.children) {
      obj.children.forEach((obj:any)=> {             
        tracks(obj)
      })
  }
  track(obj)
}

// 销毁图纸控件实例
function beforeDestroy() {
  try {
    // 获取当前绘制控件对象
    const draw = MxFun.getCurrentDraw();
    // THREE场景
    const scene = draw.getScene() as any;
    // 删除scene场景对象
    resourceTracker.removeObj(scene)
    scene.clear && (scene).clear();
    // 销毁跟踪了的所有资源
    resourceTracker.dispose();
    const renderer = draw.getRenderer() as any;
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.content = null;
    let gl = renderer.domElement.getContext("webgl");
    if(gl) {
      const WEBGL_lose_context = gl.getExtension("WEBGL_lose_context")
      WEBGL_lose_context && WEBGL_lose_context.loseContext()
    }
    // 停止所有动画
    animateStop()
    // console.log(renderer.info);   // 查看memery字段 看资源是否清理掉了
  } catch(e) {
    console.log(e);
  }
}


export class MxMap{
  public canvas: HTMLCanvasElement | null = null;
  public gl:WebGLRenderingContext | undefined = void 0;
  public cadLocation1: THREE.Vector3 = new THREE.Vector3();
  public cadLocation2: THREE.Vector3 = new THREE.Vector3()
  public elevation: number = 0
  public customLayer:object = {};
  public mxObj: MxDrawObject | null = null;
  public matCadToMap: THREE.Matrix4 = new THREE.Matrix4();
  public matMapToCad: THREE.Matrix4 = new THREE.Matrix4();
  public matrix?: number[];
  public render(gl: WebGLRenderingContext, matrix: number[]){

  }
  public cadToMercatorCoord(pt:THREE.Vector3):mapboxgl.MercatorCoordinate{
    pt.applyMatrix4(this.matCadToMap);
    return new mapboxgl.MercatorCoordinate(pt.x,pt.y,pt.z); 
  }
  
  public mercatorCoordToCad(pt:mapboxgl.MercatorCoordinate | THREE.Vector3):THREE.Vector3{
    let ptRet = new THREE.Vector3(pt.x,pt.y,pt.z);
    ptRet.applyMatrix4(this.matMapToCad);
    return ptRet; 
  }

  public cadLongToMercatorCoord(len:number):number{
    let pt1 = new THREE.Vector3(0,0,0);
    let pt2 = new THREE.Vector3(len,0,0);
    pt1.applyMatrix4(this.matCadToMap);
    pt2.applyMatrix4(this.matCadToMap);
    return pt1.distanceTo(pt2);
  }

}


export async function init(map: Map, origin: [number, number], kilometers:number = 1,cadFile:string="empty.dwg" ) {

  return new Promise<MxMap>((resolve, reject)=> {
    let mxMap = new MxMap()
    // 图纸或者模型的高度
    let modelAltitude = 0;

    // 将 LngLat 投影转换为 墨卡托投影坐标
    let point = mapboxgl.MercatorCoordinate.fromLngLat(
      origin,
      modelAltitude
    );

    
    // 返回在此纬度上以墨卡托坐标单位表示的1米距离。
    // 对于现实世界中使用米单位的坐标，这自然提供了转换为墨卡托投影坐标的比例尺
    let lDistForM = point.meterInMercatorCoordinateUnits();
    
    // 通过传入的 kilometers（公里） 数值决定该cad图纸在现实中的范围是几公里
    let lCADArea = 1000 * lDistForM * kilometers;
   
    // 从而确定cad图上的具体位置
    mxMap.cadLocation1 = new THREE.Vector3(point.x - lCADArea / 2, point.y - lCADArea, point.z);
    mxMap.cadLocation2 = new THREE.Vector3(point.x + lCADArea, point.y + lCADArea / 2, point.z);
    
    // mapbox创建一个自定义图层
    let customLayer: mapboxgl.CustomLayerInterface = {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      async onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        try {
          // 判断mxdraw是否已经加载过
          if(!store.state.MxFun) {
            await loadCoreCode()
          }
          // 拿到mapbox的canvas元素
          mxMap.canvas = map.getCanvas();
          // 以及webgl上下文
          mxMap.gl = gl
          // 创建图纸控件对象
          MxFun.createMxObject({
            // mapBox 提供 mapbox的一些必要参数
            mapBox: mxMap,
            // 要打开的图纸
            cadFile: cadFile,
            callback: (mxObj: MxDrawObject) => {
              mxMap.mxObj = mxObj;
              mxObj.addEvent("loadComplete", () => {
                console.log("mx loadComplete");
                // render函数 赋值后再渲染一次
                const scene = mxObj.getScene()
                // 将这个图纸控件对象的场景对象加入到THREE资源跟踪中,方便销毁时释放资源
                tracks(scene)
                // 更新mapbox
                map.triggerRepaint()

                resolve(mxMap)
              });
            }
          }); 
          
          // 注册各种示例的命令
          cmdInit()
        } catch(e) {
          reject(e)
        }
        
      },
      render(gl: WebGLRenderingContext, matrix: number[]): void {
        // 赋值矩阵信息
        mxMap.matrix = matrix
        // 在创建图纸后会提供一个渲染函数,用于更新图纸
        mxMap.render(gl, matrix);
        // 运行动画
        animateRun()
        // 刷新mapbox
        map.triggerRepaint()
      }
    };
    // 赋值这个自定义图层的信息
    mxMap.customLayer = customLayer
    //  添加自定义图层 并将这个图纸的层级优先为线图层 map.addGroupLayer 添加了这样的分组的空图层
    map.addLayer(customLayer,  map.getLayer("mx.layer.line") ?  'mx.layer.line' : void 0)
    map.on('remove',()=> {
      // 地图删除触发对图纸的销毁函数
      beforeDestroy()
    })
    
    
  })
 
}

