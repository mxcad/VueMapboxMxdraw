import { MxMapBox } from "../init"
import * as turf from "@turf/turf"
import { fabric } from "fabric"
import mapboxgl from "mapbox-gl"
import { GUI } from "dat.gui";
import { MyMarker } from "../pointTag/setHeight";
// 图纸批注
export function drawingNotation() {
    const map = MxMapBox.getMap()
    // 得到地图范围
    const bounds = map.getBounds().toArray()
    // 当前范围的包围盒
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox

    let drawCanvas: HTMLCanvasElement | null;
    let fabricCanvas: fabric.Canvas
    let canvasCoord1: any, canvasCoord2: any;
    let canvasWidth: number, canvasHeight: number;
    let drawType: any;
    const beginFreeDraw = () => {
        if (drawCanvas) {
            return
        }

        // 先使地图不要放置倾斜
        map.setPitch(0);
        map.setBearing(0);

        let mapCanvas = map.getCanvas();
        drawCanvas = document.createElement("canvas");
        
        let rect = mapCanvas.getBoundingClientRect();
        document.getElementsByTagName('main')[0].appendChild(drawCanvas)
    
        canvasWidth = rect.width;
        canvasHeight = rect.height;
        initFabric(drawCanvas, canvasWidth, canvasHeight);  
        const div =  drawCanvas.parentElement
        if(div) {
            div.style.position = "fixed";
            div.style.left = rect.left + "px";
            div.style.top = rect.top + "px";
            div.style.width = rect.width + "px";
            div.style.height = rect.height + "px";
        }
        canvasCoord1 = map.unproject(new mapboxgl.Point(canvasWidth / 2, canvasHeight / 2))
        canvasCoord2 =  mapboxgl.MercatorCoordinate.fromLngLat(map.unproject(new mapboxgl.Point(canvasWidth, canvasHeight)))
    }

    const initFabric = (drawCanvas: HTMLCanvasElement, width: number, height: number) => {
        let canvas = new fabric.Canvas(drawCanvas, {
            isDrawingMode: false,
            selection: true,
            width: width,
            height: height
        });
        fabricCanvas = canvas;
        //
        //变量声明
        let mouseFrom: { x: number; y: number; } = {
                x: 0,
                y: 0
            },
            mouseTo:{ x: number; y: number; } = {
                x: 0,
                y: 0
            },
            textbox = null;
        let drawWidth = 5; //笔触宽度
        let color = "#e34f51"; //画笔颜色
        let drawingObject: fabric.Object | null = null; //当前绘制对象
        let moveCount = 1; //绘制移动计数器
        let doDrawing = false; // 绘制状态

        canvas.freeDrawingBrush.color = color; //设置自由绘颜色
        canvas.freeDrawingBrush.width = drawWidth;

        //绑定画板事件
        const down = (options: { e: any}) => {
            if (fabricCanvas.selection) return;
            if (options.e.touches) {
                // 移动端
                mouseFrom.x = options.e.touches[0].clientX;
                mouseFrom.y = options.e.touches[0].clientY;
            } else {
                mouseFrom.x = options.e.offsetX;
                mouseFrom.y = options.e.offsetY;
            }

            doDrawing = true;
        }
        canvas.on("mouse:down", down);
        canvas.on("touchstart", down);

        const up = (options: { e: any }) => {
            if (fabricCanvas.selection) return;
            if (!options.e.touches) {
                mouseTo.x = options.e.offsetX;
                mouseTo.y = options.e.offsetY;
            }
            // drawing();
            if (drawingObject) {
                fabricCanvas.setActiveObject(drawingObject);
                fabricCanvas.requestRenderAll();
            }

            drawingObject = null;
            moveCount = 1;
            doDrawing = false;
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = true;

        }
        canvas.on("mouse:up", up);
        canvas.on("touchend", up);

        const move = (options: {e:any}) => {
            if (fabricCanvas.selection) return;
            if (moveCount % 2 && !doDrawing) {
                //减少绘制频率
                return;
            }
            moveCount++;
            if (options.e.touches) {
                // 移动端
                mouseTo.x = options.e.touches[0].clientX;
                mouseTo.y = options.e.touches[0].clientY;
            } else {
                mouseTo.x = options.e.offsetX;
                mouseTo.y = options.e.offsetY;
            }

            drawing();
        }
        canvas.on("mouse:move", move);
        canvas.on("touchmove", move);


        //绘画方法
        function drawing() {
            if (drawingObject) {
                canvas.remove(drawingObject);
            }
            let canvasObject = null, left, top, radius, path;
            switch (drawType) {
                case "arrow": //箭头
                    canvasObject = new fabric.Path(drawArrow(mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y, 30, 30), {
                        stroke: color,
                        fill: "rgba(255,255,255,0)",
                        strokeWidth: drawWidth
                    });
                    break;
                case "line": //直线
                    canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
                        stroke: color,
                        strokeWidth: drawWidth
                    });
                    break;
                case "dottedline": //虚线
                    canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
                        strokeDashArray: [3, 1],
                        stroke: color,
                        strokeWidth: drawWidth
                    });
                    break;
                case "circle": //正圆
                     left = mouseFrom.x,
                     top = mouseFrom.y;
                     radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
                    canvasObject = new fabric.Circle({
                        left: left,
                        top: top,
                        stroke: color,
                        fill: "rgba(255, 255, 255, 0)",
                        radius: radius,
                        strokeWidth: drawWidth
                    });
                    break;
                case "ellipse": //椭圆
                     left = mouseFrom.x,
                     top = mouseFrom.y;
                     radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
                    canvasObject = new fabric.Ellipse({
                        left: left,
                        top: top,
                        stroke: color,
                        fill: "rgba(255, 255, 255, 0)",
                        originX: "center",
                        originY: "center",
                        rx: Math.abs(left - mouseTo.x),
                        ry: Math.abs(top - mouseTo.y),
                        strokeWidth: drawWidth
                    });
                    break;
                case "rectangle": //长方形
                    path =
                        "M " +
                        mouseFrom.x +
                        " " +
                        mouseFrom.y +
                        " L " +
                        mouseTo.x +
                        " " +
                        mouseFrom.y +
                        " L " +
                        mouseTo.x +
                        " " +
                        mouseTo.y +
                        " L " +
                        mouseFrom.x +
                        " " +
                        mouseTo.y +
                        " L " +
                        mouseFrom.x +
                        " " +
                        mouseFrom.y +
                        " z";
                    canvasObject = new fabric.Path(path, {
                        left: left,
                        top: top,
                        stroke: color,
                        strokeWidth: drawWidth,
                        fill: "rgba(255, 255, 255, 0)"
                    });
                    //也可以使用fabric.Rect
                    break;
                case "rightangle": //直角三角形
                    path = "M " + mouseFrom.x + " " + mouseFrom.y + " L " + mouseFrom.x + " " + mouseTo.y + " L " + mouseTo.x + " " + mouseTo.y + " z";
                    canvasObject = new fabric.Path(path, {
                        left: left,
                        top: top,
                        stroke: color,
                        strokeWidth: drawWidth,
                        fill: "rgba(255, 255, 255, 0)"
                    });
                    break;
                case "equilateral": //等边三角形
                    height = mouseTo.y - mouseFrom.y;
                    canvasObject = new fabric.Triangle({
                        top: mouseFrom.y,
                        left: mouseFrom.x,
                        width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
                        height: height,
                        stroke: color,
                        strokeWidth: drawWidth,
                        fill: "rgba(255,255,255,0)"
                    });
                    break;
                case "text":
                    textbox = new fabric.Textbox("", {
                        left: mouseFrom.x - 60,
                        top: mouseFrom.y - 20,
                        width: 150,
                        fontSize: 30,
                        borderColor: "yellow",
                        fill: color,
                        hasControls: true
                    });
                    canvas.add(textbox);
                    textbox.enterEditing();
                    textbox.hiddenTextarea && textbox.hiddenTextarea.focus();
                    break;
                case "remove":
                    break;
                default:
                    break;
            }
            if (canvasObject) {
                canvas.add(canvasObject);
                drawingObject = canvasObject;
            }
        }

        //绘制箭头方法
        function drawArrow(fromX:number, fromY:number, toX:number, toY:number, theta:number, headlen:number) {
            theta = typeof theta != "undefined" ? theta : 30;
            headlen = typeof theta != "undefined" ? headlen : 10;
            // 计算各角度和对应的P2,P3坐标
            let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
                angle1 = (angle + theta) * Math.PI / 180,
                angle2 = (angle - theta) * Math.PI / 180,
                topX = headlen * Math.cos(angle1),
                topY = headlen * Math.sin(angle1),
                botX = headlen * Math.cos(angle2),
                botY = headlen * Math.sin(angle2);
            let arrowX = fromX - topX,
                arrowY = fromY - topY;
            let path = " M " + fromX + " " + fromY;
            path += " L " + toX + " " + toY;
            arrowX = toX + topX;
            arrowY = toY + topY;
            path += " M " + arrowX + " " + arrowY;
            path += " L " + toX + " " + toY;
            arrowX = toX + botX;
            arrowY = toY + botY;
            path += " L " + arrowX + " " + arrowY;
            return path;
        }
    }

    const draw = (dType: string) => {
        
        beginFreeDraw();
        if (dType == "freedraw") {
            fabricCanvas.isDrawingMode = true;
        } else {
            fabricCanvas.isDrawingMode = false;
        }
        fabricCanvas.selection = false;
        drawType = dType;
    }

    const selectDel = () => {
        var selected = fabricCanvas.getActiveObjects(),
            selGroup = new fabric.ActiveSelection(selected, {
                canvas: fabricCanvas
            });
        if (!selGroup) return;

        selGroup.forEachObject(function (obj) {
            fabricCanvas.remove(obj);
        });
        fabricCanvas.discardActiveObject().renderAll();
    }

    const endFreeDraw = () => {
        if (!canvasCoord1) return;
       
        const el = document.createElement('div')
        let svg = fabricCanvas.toSVG()
       
        
        el.innerHTML = `
        ${svg}
        `
        new MyMarker({
            element: el,
            scaleMaxZoom: map.getZoom(),
            isAutoScale: true,
            pitchAlignment: "map",
            rotationAlignment: "map"
        }).setLngLat(canvasCoord1).addTo(map)
        if (drawCanvas) {
            drawCanvas.parentElement?.remove()
            drawCanvas = null;
        }
    }
    draw("equilateral")
  
    const gui = new GUI()
    gui.add({ drawType: "equilateral"}, 'drawType',  ['arrow', 'freedraw', 'line', 'dottedline', 'circle', 'ellipse', 'rectangle', 'rightangle', 'equilateral', 'text']).onChange((type)=> {
        draw(type)
    })
    gui.add({selectDel}, 'selectDel')
    gui.add({endFreeDraw}, 'endFreeDraw')
    map.on('remove', ()=> {
        gui.destroy()
    })
}

