import { random } from "@/mxthree/utils";
import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl"
import { MxMapBox } from "..";
import { Map } from "../Map";
import { DivOverlay } from "./DivOverlay";

function bindAll (keys:string[], obj:any) {
    keys.forEach((key)=> {
        obj[key] && (obj[key] = obj[key].bind(obj))
    })
}

function pointFromString(t:any){
    let e=(t=null!=t?t:"").split(",");
    if(2==e.length)
    return {
        x: +e[0],
        y: +e[1]
    };
    if(e.length>=3)
    return {
        x: +e[0],
        y: +e[1],
        z: +e[2]
    };

    throw Error("param is not string format x,y")
}

function updateLngLatBounds(t:any, d:any) {
    if(d.toArray) d = d.toArray()
    let e=-1/0,i=-1/0,r=1/0,n=1/0;
    d[0][0]!=1/0&&d[0][1]!=-1/0&&(e=d[1][0],i=d[1][1],r=d[0][0],n=d[0][1]);for(let o=0;o<t.length;o++){const s=t[o];s.x<r&&(r=s.x),s.x>e&&(e=s.x),s.y<n&&(n=s.y),s.y>i&&(i=s.y)}
    d[0][0]=r,d[0][1]=n,d[1][0]=e,d[1][1]=i
    return new mapboxgl.LngLatBounds(d)
}
function updateByBounds(t:any,d:any){
    let e,i=-1/0,r=-1/0,n=1/0,o=1/0;
    d[0][0]!=1/0&&d[0][1]!=-1/0&&(i=d[1][0],r=d[1][1],n=d[0][0],o=d[0][1]),Array.isArray(t)||(t=[t]);
    for(let s=0;s<t.length;s++)e=t[s],e[0][0]<n&&(n=e[0][0]),e[0][1]<o&&(o=e[0][1]),e[1][0]>i&&(i=e[1][0]),e[1][1]>r&&(r=e[1][1]);
    d[0][0]=n,d[0][1]=o,d[1][0]=i,d[1][1]=r
    return new mapboxgl.LngLatBounds(d)
} 


const EQUATORIAL_SEMIPERIMETER = 20037508.3427892
const  EARTH_BOUNDS = [
    -20037508.3427892,
    -20037508.3427892,
    20037508.3427892,
    20037508.3427892
]
function fromMercator(t:[number, number], mapExtent: mapboxgl.LngLatBounds):[number, number]{
    const min =  {
        x: mapExtent.getSouthWest().lng,
        y: mapExtent.getSouthWest().lat
    }
    const _ratio_x = EARTH_BOUNDS[2]-EARTH_BOUNDS[0] / mapExtent.getNorth()
    const _ratio_y = EARTH_BOUNDS[3]-EARTH_BOUNDS[1] / mapExtent.getEast()
    return[min.x+(EARTH_BOUNDS[0])/_ratio_x,min.y+(t[1]-EARTH_BOUNDS[1])/_ratio_y]
}
function lngLat2Mercator(t:any): [number, number] {
    let e = mapboxgl.LngLat.convert(t),
    i=e.lng * EQUATORIAL_SEMIPERIMETER /180;
    let o=Math.log(Math.tan((90+e.lat)*Math.PI/360))/(Math.PI/180);
    return o=o*EQUATORIAL_SEMIPERIMETER/180,[i,o]
}
function fromLngLat(t:any, d:mapboxgl.LngLatBounds) {
    const e = lngLat2Mercator(t)
    return mapboxgl.LngLat.convert(fromMercator(e, d))
}
function fromLngLatBouunds(d:mapboxgl.LngLatBounds) {
    return new mapboxgl.LngLatBounds(
        fromLngLat(d.getSouthWest(), d),
        fromLngLat(d.getNorthEast(), d)
        )
}

function isIntersect(t:mapboxgl.LngLatBounds, e:mapboxgl.LngLatBounds){
    return e.getSouthWest().lng<=t.getSouthWest().lng
    &&e.getNorthEast().lng>=t.getNorthEast().lng
    &&e.getSouthWest().lat<=t.getSouthWest().lat
    &&e.getNorthEast().lat>=t.getSouthWest().lat
}
function scaleLngLatBouunds(t:number,o:mapboxgl.LngLatBounds,e?:mapboxgl.LngLat){
    if(isNaN(t))return new mapboxgl.LngLatBounds(o.getSouthWest(), o.getNorthEast());

    t=t||1,
    e||(e=o.getCenter());
    const i=e.lng,r=e.lat,
    n=(o.getSouthWest().lng-i)*t+i,
    s=(o.getSouthWest().lat-r)*t+r,
    l=(o.getNorthEast().lng-i)*t+i,
    c=(o.getNorthEast().lat-r)*t+r;
    return new mapboxgl.LngLatBounds([n,s],[l,c])
}
function isContains(t:mapboxgl.LngLatBounds, e:mapboxgl.LngLatBounds){
    let _t = t.toArray()
    let _e = e.toArray()
    return _e[0][0]<=_t[0][0]&&_e[0][1]<=_t[0][1]&&_e[1][0]>=_t[1][0]&&_e[1][1]>=_t[1][1]
}

export class SvgOverlay {
    type: 'svgOverlay';
    bounds: mapboxgl.LngLatBounds;
    options: any;
    private _map: any;
    svgParentElement: any
    divOverlay!: DivOverlay;
    elements: any;
    constructor(t?: any) {
        this.options=t||{},
        this.bounds= new mapboxgl.LngLatBounds,
        this.type="svgOverlay",
        bindAll(["update"], this)
    }
    
    addTo(t: Map,e?: any) {
        this._map=t;
        this.bounds = t.getBounds()
        const i=document.createElement("div");
        let s="http://www.w3.org/2000/svg";
        const a=document.createElementNS(s,"svg");
        let l:any = {xmlns:s,viewBox:"0 0 0 0",preserveAspectRatio:"xMinYMin meet"};
        for(let t in l) {
            a.setAttribute(t,l[t]);
        }
        i.className="svgOverlay"+(this.options.divClassName ? " "+this.options.divClassName:""),
        i.style.width="0px",
        i.style.height="0px",
        i.id= 'svgOverlay' + (Math.random() * 1e9 >>> 0).toString(),
        this.svgParentElement=a,i.appendChild(a),
        this.divOverlay=new DivOverlay(Object.assign({
            bounds: new mapboxgl.LngLatBounds([0, 0, 0, 0]),
            element:i,
            width:0,
            height:0,
            updateDivSize:true
        }, this.options)),
        this.divOverlay._ower=this,
        this.divOverlay.addTo(t,e),
        this.options.noUpdateBoundsWhenMoveend||this._map.on("moveend",this.update)
        this._map._svgOverlays=this._map._svgOverlays||[],
        this._map._svgOverlays.push(this)
    }
    
    remove() {
        let t;
        if(
            null===(t=this.divOverlay)||
            void 0===t||
            t.remove(),
            this.options.noUpdateBoundsWhenMoveend||
            this._map.off("moveend",this.update),
            this._map._svgOverlays&&Array.isArray(this._map._svgOverlays)
        ){
            const t=this._map._svgOverlays.indexOf(this);
            t>=0&&this._map._svgOverlays.splice(t,1)
        }
    }
    addElement(t: { hidden?: any; minZoom?: any; maxZoom?: any; html?: any; event?: any; bounds?: any;id?:any } | string,e?: boolean){
        "string"==typeof t
        &&
        (t={html:t});
        let {html:i,event:r,bounds:o, id}=t;

        if(this.elements=this.elements||[],
            this.elements.push(Object.assign({},t)),
            t.hidden
        )return;
        let a=this._map.getZoom();
        if(turf.isNumber(t.minZoom)&&a<t.minZoom)return;
        if(turf.isNumber(t.maxZoom)&&a>=t.maxZoom)return;
        Array.isArray(o)&&(o=new mapboxgl.LngLatBounds(o as any));
        let l= null!=o ? o: new mapboxgl.LngLatBounds([0, 0, 0, 0]);
        i.replace(/\{\{((d=|x=|cx=|x1=|x2=)?[-+]?\d+[.]?\d+),\s*((y=|cy=|y1=|y2=)?[-+]?\d+[.]?\d+)\}\}/g,
        (t: string)=>{
            let e=t.substring(2,t.length-2);
            if(e.indexOf("=")>=0){
                let t=["d=","cx=","cy=","x1=","y1=","x2=","y2=","x=","y="];
                for(let i of t)e=e.replace(i,"")
            } 
            return l = updateLngLatBounds([pointFromString(e)], l), t
            return t
            
        });
    
        let c=0;
        let sw = l.getSouthWest(),
        ne = l.getNorthEast()

        i.replace(/\{\{([-+]?\d+[.]?\d+)\}\}/g, (t: string)=> {
            let e=+t.substring(2,t.length-2);
            return e>c&&(c=e),t
        })

        sw.lng-=c,
        sw.lat-=c,
        ne.lng+=c,
        ne.lat+=c
        l.setSouthWest(sw)
        l.setNorthEast(ne)
        let u=!1;
        // let features = turf.featureCollection([
        //     turf.point([sw.lng, sw.lat], {"name": "Location A"}),
        //     turf.point([ne.lng, ne.lat], {"name": "Location B"}),
        // ]);
          
        //   let enveloped = turf.envelope(features);
     
        // if(!this.options.noUpdateBoundsWhenMoveend) { 
        //     let t = fromLngLatBouunds(this._map.getBounds())

        //     t = scaleLngLatBouunds(2, t)
        
        //     isIntersect(l, t) || isContains(l, t) || (u=!0)
        // }
   
        if(l.toArray) l = l.toArray()
        if(this.elements[this.elements.length-1].isOutScreen=u,u)return;
        let h=this._map.getBounds().toArray();
        l[0][0]<h[0][0]&&(l[0][0]=h[0][0]),l[0][1]<h[0][1]&&(l[0][1]=h[0][1]),
        l[1][0]>h[1][0]&&(l[1][0]=h[1][0]),l[1][1]>h[1][1]&&(l[1][1]=h[1][1]),
        
        !0!==e&&this.update(!0)
    }
    addElements(t: string | any[],e: boolean){
        this.elements=this.elements||[];
        for(let e=0;e<t.length;e++)this.addElement(t[e],!0);
        !0!==e&&this.update(!0)
    }
    getSvgContainer(){
        return this.svgParentElement
    }
    getElements(){return this.elements}
    removeElements(t: string | any[]){
        "string"==typeof t&&(t=[t]);
        let e=!1;
        for(let i=0;i<t.length;i++){
            let r=this.elements.findIndex((e: { id: any; html: any; })=>e.id===t[i]||e.html==t[i]);
            r>=0&&(this.elements.splice(r,1),e=!0)
        }
        return e&&this.update(),this.elements
    }
    updateElements(t: string | any[]){
        Array.isArray(t)||(t=[t]);
        let e=!1;
        for(let i=0;i<t.length;i++){
            let r=this.elements.findIndex((e: { id: any; html: any; })=>e.id===t[i].id||e.html==t[i].html);
            r>=0&&(e=!0,this.elements[r]=Object.assign(Object.assign({},this.elements[r]),t[i]))
        }
        return e&&this.update(),this.elements
    }
    update(t?: boolean | undefined){
        var e,i,r;
        let o=null!==(e=this.options.svgOffset)&&void 0!==e?e:10,
        a=null!==(i=this.options.svgMaxWidth)&&void 0!==i?i:1e3,
        l=null!==(r=this.options.svgMaxHeight)&&void 0!==r?r:1e3,
        c:any={},u:any={},h=1;
        if(!0!==t){
            let t=[...this.elements];
            this.elements=[],
            this.bounds= this._map.getBounds(),this.addElements(t,!0)
        }
        let d= this.bounds.toArray();
      
        const width = Math.abs(d[0][0]-d[1][0]);
        const height = Math.abs(d[0][1]- d[1][1]);
        width >= height
        ?
        (h=width/(a-2*o),l=(h*o+height)/h+o)
        :
        height>width&&(h=height/(l-2*o),
        a=(h*o+width)/h+o);
        let p=h*o;
        c.x=d[0][0]-p,
        c.y=d[1][1]+p,
        u.x=c.x+a*h,
        u.y=c.y-l*h;
        let f = new mapboxgl.LngLatBounds([c.x,u.y,u.x,c.y])
        const m=(t: { x: number; y: number; })=>[(t.x-c.x)/h,(c.y-t.y)/h];
        this.divOverlay.updateBounds(f),
        this.divOverlay.updateSize(a, l),
        this.svgParentElement.setAttribute("viewBox",`0 0 ${a} ${l}`);
        let g="",
        y=this._map.getZoom();
        for(let t=0;t<this.elements.length;t++){
            if(this.elements[t].hidden||this.elements[t].isOutScreen)continue;
            if(turf.isNumber(this.elements[t].minZoom)&&y<this.elements[t].minZoom)continue;
            if(turf.isNumber(this.elements[t].maxZoom)&&y>=this.elements[t].maxZoom)continue;
            let e=this.elements[t].html;
            e=e.replace(/\{\{((d=|x=|cx=|x1=|x2=)?[-+]?\d+[.]?\d+),\s*((y=|cy=|y1=|y2=)?[-+]?\d+[.]?\d+)\}\}/g,
                (            t: string)=>{
                let e=t.substring(2,t.length-2);
                if(e.indexOf("=")>=0){
                    let i=["d=","cx=","cy=","x1=","y1=","x2=","y2=","x=","y="];
                    for(let t of i)e=e.replace(t,"");
                    let r=m(pointFromString(e));
                    return t.indexOf("{{cx=")>=0
                    ?
                    ` cx="${r[0]}" cy="${r[1]}" `
                    :
                    t.indexOf("{{x1=")>=0
                    ?
                    ` x1="${r[0]}" y1="${r[1]}" `
                    :
                    t.indexOf("{{x2=")>=0
                    ?
                    ` x2="${r[0]}" y2="${r[1]}" `
                    :
                    t.indexOf("{{x=")>=0
                    ?
                    ` x="${r[0]}" y="${r[1]}" `
                    :
                    t.indexOf("{{d=")>=0
                    ?
                    `${r[0]} ${r[1]}`
                    :
                    `${r[0]},${r[1]}`
                }
                {let t=m(pointFromString(e));return`${t[0]},${t[1]}`}
            }),
            e=e.replace(/\{\{([-+]?\d+[.]?\d+)\}\}/g,(t: string)=>+t.substring(2,t.length-2)/h+""),
            g+=e
        }
        this.svgParentElement.innerHTML=g;
        for(let t=0;t<this.elements.length;t++)"function"==typeof this.elements[t].event&&this.elements[t].event(this.svgParentElement)
    }
    static attr_cx_cy_r(t: any,e: any,i: number){
        return`{{cx=${t},cy=${e}}} r="{{${i}}}"`
    }
    static attr_cx_cy_rx_ry(t: any,e: any,i: number,r: number){
        return`{{cx=${t},cy=${e}}} rx="{{${i}}}" ry="{{${r}}}"`
    }
    static attr_x1_y1_x2_y2(t: any,e: any,i: any,r: any){
        return`{{x1=${t},y1=${e}}} {{x2=${i},y2=${r}}}`
    }
    static attr_x_y_w_h(t: any,e: any,i: any,r: number){
        return`{{x=${t},y=${e}}} width="{{${i}}}" height="{{${r}}}"`
    }
    static attr_x_y(t: any,e: any){
        return`{{x=${t},y=${e}}}`
    }
    static attr_fontsize(t: any){
        return`font-size="{{${t}}}"`
    }
    static attr_length(t: number){
        return`{{${t}}}`
    }
    static attr_point(t: { x: any; y: any; },e?: boolean | undefined){
        return" "==(e?",":" ")?`{{d=${t.x},${t.y}}}`:`{{${t.x},${t.y}}}`
    }
    static attr_points(t: any[]){
        return`points="${t.map((t: { x: any; y: any; })=>`{{${t.x},${t.y}}}`).join(" ")}"`
    }
    static attr_path(t: string | any[]){
        if(0==t.length)return"";
        let e="M"+this.attr_point(t[0],!0)+" ";
        for(let i=1;i<t.length;i++)e+="L"+this.attr_point(t[i],!0)+" ";return e
    }
}


export function SvgOverlayTest() {
    const map = MxMapBox.getMap()
     // 得到地图范围
     const bounds = map.getBounds().toArray()
     // 当前范围的包围盒
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    const len = 0.005
    const randomColor = ()=> {
        return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`
    }
    const randomPoint =()=> {
        const point = turf.randomPosition(bbox)
        return new mapboxgl.Point(point[0], point[1])
    }

    const randomPoints =(n:number)=> {
        let points =[]
        for(let i = 0; i < n; i++) points.push(randomPoint())
        return points
    }
    let svgOverlay = new SvgOverlay();
    svgOverlay.addTo(map);
    // 增加渐变色
    svgOverlay.addElement(`
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style="stop-color:${randomColor()};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${randomColor()};stop-opacity:1" />
            </radialGradient>
          </defs>
    `)


    const getStyle = (style:any = {}) => {
        return Object.keys(style).map(key => `${key}:${style[key]}`).join(";")
    }
    const svgRectHtml = (point: { x: any; y: any; }, width: any, height: number, style: { fill: any; opacity: number; }, id?:string) => {
        return ` <rect ${id ? 'id=' + id: ''} ${SvgOverlay.attr_x_y_w_h(point.x, point.y, width, height)} style="${getStyle(style)}"/>`
    }
    const svgCircleHtml = (point: { x: any; y: any; }, r: number, style: any) => {
        return ` <circle ${SvgOverlay.attr_cx_cy_r(point.x, point.y, r)} style="${getStyle(style)}"/>`
    }
    const svgEllipseHtml = (point: { x: any; y: any; }, rx: number, ry: number, style: { fill: any; opacity: number; }) => {
        return ` <ellipse  ${SvgOverlay.attr_cx_cy_rx_ry(point.x, point.y, rx, ry)} style="${getStyle(style)}"/>`
    }
    const svgPolygonHtml = (points: any, style: { fill: any; opacity: number; }) => {
        return ` <polygon  ${SvgOverlay.attr_points(points)} style="${getStyle(style)}"/>`
    }
    
    const svgLineHtml = (point1: { x: any; y: any; }, point2: { x: any; y: any; }, style: { stroke: any; "stroke-width": number; }) => {
        return ` <line  ${SvgOverlay.attr_x1_y1_x2_y2(point1.x, point1.y, point2.x, point2.y)} style="${getStyle(style)}"/>`
    }
    
    const svgPolylineHtml = (points: any, style: { stroke: any; fill: string; "stroke-width": number; }) => {
        return ` <polyline  ${SvgOverlay.attr_points(points)} style="${getStyle(style)}"/>`
    }
    
    const svgPathHtml = (point1: any, point2: any, point3: any, style: { stroke: any; fill: string; "stroke-width": number; }) => {
        return ` <path  d="M ${SvgOverlay.attr_point(point1)} Q ${SvgOverlay.attr_point(point2)} ${SvgOverlay.attr_point(point3)}" style="${getStyle(style)}"/>`
    }
    
    const svgTextHtml = (point: { x: any; y: any; }, textContent: string, style: { stroke: any; "stroke-width": string; fill: any; "font-size": any; }) => {
        return `<text ${SvgOverlay.attr_x_y(point.x, point.y)}  style="${getStyle(style)}"">${textContent}</text>`
    }
    
    const addRect = (id?: string)=> {
        if (id) {    
        
            return svgOverlay.addElement({
                html: svgRectHtml(randomPoint(), len, len / 2, {fill: randomColor(), opacity: 0.7}, id),
                id,
                event: (svgParentElement: any) => {
                    // 事件回调
                    let ele = svgParentElement.getElementById(id);
                  
                    if (!ele) return;
                    ele.addEventListener("mouseover", (e:any) => ele.style.opacity = 0.6);
                    ele.addEventListener("mouseout", (e:any) => ele.style.opacity = 1.0);
                    ele.addEventListener("click", () => console.log("点击了矩形" + id));
                }
            });
        } else {
            svgOverlay.addElement(svgRectHtml(randomPoint(), len, len / 2, {fill: randomColor(), opacity: 0.7}));
        }
    }

    const addCircle = ()=> svgOverlay.addElement(svgCircleHtml(randomPoint(), len /2, {fill: randomColor(), opacity: 0.7}))
    
    const addPolygon = ()=> svgOverlay.addElement(svgPolygonHtml(randomPoints(3), {fill: randomColor(), opacity: 0.7}))
    
    const addEllipse = ()=> svgOverlay.addElement(svgEllipseHtml(randomPoint(), len /2, len / 3, {fill: randomColor(), opacity: 0.7}))
    
    const addLine = ()=> svgOverlay.addElement(svgLineHtml(randomPoint(), randomPoint(), {stroke: randomColor(), "stroke-width": 2}))
    
    const addPolyline = ()=> svgOverlay.addElement(svgPolylineHtml(randomPoints(5), {stroke: randomColor(), fill: "none", "stroke-width": 2}))
    
    const addPath = ()=> {
        let p1 = randomPoint();
        let p2 = randomPoint();
        let p3 = randomPoint();
        svgOverlay.addElement({
            html: svgPathHtml(p1, p2, p3, {stroke: randomColor(), fill: "none", "stroke-width": 2}),
        })
    }
    const addText = ()=> {
        let pt = randomPoint();
        let textHeight = random(0.01 / 30, 0.01 / 20);
        let textContent = 'mapd';
        let textWidth = textContent.length;
        let textBounds = new mapboxgl.LngLatBounds([pt.x - textWidth, pt.y - textHeight, pt.x + textWidth, pt.y + textHeight])

        svgOverlay.addElement({
            html: svgTextHtml(pt, textContent, {stroke: randomColor(), "stroke-width":"2", fill: randomColor(),  "font-size" : SvgOverlay.attr_length(textHeight)}),
            bounds: textBounds,
        })
    }
    const addCircle1 = ()=> {
        let id = "circle1";
        return svgOverlay.addElement({
            html: svgCircleHtml(randomPoint(), len /4, {fill: "url(#grad1)", stroke: randomColor(), "stroke-width": 3, cursor: "pointer"}),
            event: (svgParentElement:any) => {
                // 事件回调
                let ele = svgParentElement.getElementById(id);
                if (!ele) return;
                ele.addEventListener("mouseover", (e:any) => ele.style.opacity = 0.6);
                ele.addEventListener("mouseout", (e:any) => ele.style.opacity = 1.0);
                ele.addEventListener("click", (e:any) => console.log("点击了圆" + id));
            }
        })
    }
    addRect('mxRect');
    addCircle();
    addCircle1();
    addEllipse();
    addPolygon();
    addLine();
    addPolyline();
    addPath();
    addText();
    
}
