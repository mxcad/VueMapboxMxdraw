import { MxMapBox } from "..";
import mapboxgl from "mapbox-gl"
import { SvgOverlay } from "./SvgOverlay";

function math2DDistE(t: number,e: number,i: number,r: number){return(t-i)*(t-i)+(e-r)*(e-r)}
function math2DDist(t: number,i: number,r: number,n: number,o?: number,s?: number){return void 0!==o&&void 0!==s?Math.sqrt((t-r)*(t-r)+(i-n)*(i-n)+(o-s)*(o-s)):Math.sqrt(math2DDistE(t,i,r,n))}

let rlog = Math.log(2)
function matrix3d(t:any,e: any,i: any,o: any,s: any,a:any){const l=o+"-"+s,c=t.length;if(a.hasOwnProperty(l))return a[l];if(1===e){const e=Math.round(Math.log((1<<c)-1&~s)/rlog);return t[i][e]}const u=o|1<<i;let h=i+1;for(;o&1<<h;)h++;let d=0;for(let r=0,o=0;r<c;r++){const l=1<<r;l&s||(d+=(o%2?-1:1)*t[i][r]*matrix3d(t,e-1,h,u,s|l,a),o++)}return a[l]=d,d}

function transformerMatrix3d(t:any,e:any){ 
    const i=[
        [t[0],t[1],1,0,0,0,-e[0]*t[0],-e[0]*t[1]],
        [0,0,0,t[0],t[1],1,-e[1]*t[0],-e[1]*t[1]],
        [t[2],t[3],1,0,0,0,-e[2]*t[2],-e[2]*t[3]],
        [0,0,0,t[2],t[3],1,-e[3]*t[2],-e[3]*t[3]],
        [t[4],t[5],1,0,0,0,-e[4]*t[4],-e[4]*t[5]],
        [0,0,0,t[4],t[5],1,-e[5]*t[4],-e[5]*t[5]],
        [t[6],t[7],1,0,0,0,-e[6]*t[6],-e[6]*t[7]],
        [0,0,0,t[6],t[7],1,-e[7]*t[6],-e[7]*t[7]]
    ],
    r={},
    o = matrix3d(i,8,0,0,0,r);

    if(0===o) return;
    const s=[];
    for(let t=0;t<8;t++)for(let a=0;a<8;a++) null == s[a] && (s[a]=0) , s[a] += ((t+a)%2?-1:1) * matrix3d(i,7,0===t?1:0,1<<t,1<<a,r)/o*e[t];
   
    return s
}


// css3 transfrom matrix3d
const buildTransformerMatrix3d = (t:any,e:any)=>{
    const i = transformerMatrix3d(t,e);
    if(!i)return;
    return`matrix3d(${[i[0],i[3],0,i[6],i[1],i[4],0,i[7],0,0,1,0,i[2],i[5],0,1].join(",")})`
}

function bindAll (keys:string[], obj:any) {
    keys.forEach((key)=> {
        obj[key] && (obj[key] = obj[key].bind(obj))
    })
}

export class DivOverlay {
    options: any; 
    minZoom: number;
    maxZoom: number;
    maxPitch: number;
    isShow: boolean;
    isRemoved: boolean;
    type: string;
    _map: any;
    parentContainer: any;
    _ower: SvgOverlay | undefined;
    constructor(options:any){
        let e,i,r;
        this.options=options,
        this.minZoom= null!== (e=this.options.minZoom)&&void 0!==e?e:0,
        this.maxZoom=null!==(i=this.options.maxZoom)&&void 0!==i?i:100,
        this.maxPitch=null!==(r=this.options.maxPitch)&&void 0!==r?r:90,
        this.isShow=!1,
        this.isRemoved=!1,
        this.type="divOverlay"
        bindAll(["_updateZoom","_update"], this)
    }
    addTo(t:any, e?:any){
        let i,r,n,s;
        if(this._map=t,!this.parentContainer){
            let i=t.getCanvasContainer();
            if(e)if("string"==typeof e){
                const t=document.getElementById(e);
                t&&(i=t)
            }
            else i=e;this.parentContainer=i
        }
        this.options.element&& this.options.element.classList.add('mx-divOverlay'),
        null===(i=this._map) || void 0 === i || i.on("zoomend",this._updateZoom),
        null===(r=this._map) || void 0 === r || r.on("pitchend",this._updateZoom),
        null===(n=this._map) || void 0===n || n.on("moveend",this._update),
        null===(s=this._map) || void 0 === s || s.on("move",this._update),
        this._add()
    }
    _isShow(){
        var t,e,i,r;
        const n = null !==(e=null===(t=this._map) || void 0===t ? void 0 : t.getZoom()) && void 0 !== e ? e : 0,
        o = null !== (r=null===(i=this._map) || void 0 === i ? void 0 : i.getPitch()) && void 0 !== r ? r : 0;
        return n >= this.minZoom && n < this.maxZoom && o < this.maxPitch && !this.isRemoved 
    }
    _add(t?:any){
        var e;t||(this.isRemoved=!1),
        this._isShow() && !this.isShow && (
        this.isShow = !0, null===(e=this.parentContainer) || void 0===e || e.append(this.options.element),
        this._updateZoom(),
        this._map._divOverlays = this._map._divOverlays || [],
        this._map._divOverlays.push(this)
        )
    }
    _remove(t?:any){
        if(this.isRemoved = !t, this.isShow && (this.isShow= !1, 
            this.parentContainer && this.parentContainer.removeChild(this.options.element),
            this._map._divOverlays && Array.isArray(this._map._divOverlays))){
                const t=this._map._divOverlays.indexOf(this);
                t >= 0 && this._map._divOverlays.splice(t,1)
        }
    }
    setVisible(t:any,e:any){
        e ? this.options.element.style.display= t ? "" : "none" : t ? (this._add(), this._update()) : this._remove()
    }
    remove(){
        var t,e,i,r;
        this._remove(),
        null===(t=this._map) || void 0===t || t.off("zoomend",this._updateZoom), null===(e=this._map) || void 0===e || e.off("pitchend",this._updateZoom),
        null===(i=this._map) || void 0===i || i.off("moveend",this._update), null===(r=this._map) || void 0 === r || r.off("move",this._update)
    }
    updateBounds(t:any){
        this.options.bounds=t,
        this._update()
    }
    updateSize(t:any,e:any){
        this.options.width=t,
        this.options.height=e,
        this._update()
    }
    
    _updateZoom(){
        this.isRemoved || (this._isShow() ? (this._add(!0), this._update()) : this._remove(!0))
    }
    _updateDivSize(t:any){
        let e;
        if(!this.options.updateDivSize) return null;
        const i = null !== (e=this.options.maxDivSize) && void 0 !== e ? e : 1e7;
        return t > i && (t=i), this.options.width > this.options.height 
        ? (this.options.height=t*this.options.height/this.options.width,this.options.width=t)
        :
        (this.options.width=t*this.options.width/this.options.height,this.options.height=t),
        this.options.element.style.width = this.options.width+"px",
        this.options.element.style.height = this.options.height+"px",
        { width:this.options.width ,height:this.options.height}
    }
    _adjustCoord(t:number[],e:number[][]){
        let i,o,s;
        const a=[];
    
        for(let t=0;t<e.length;t++){
            const n=null===(i=this._map)||void 0===i?void 0: i.projectEx(e[t],
            e[t][2] || 0);
            
            a.push(n.x),
            a.push(n.y)
        }
      
        let l=0;
        for(let t=0;t<a.length;t+=2)for(let e=0;e<a.length;e+=2){
            if(t===e)continue;
            const i= math2DDist(a[t],a[t+1],a[e],a[e+1]);
            i > l && (l=i)
        }
        const c=this._updateDivSize(l);
        return c && (t=[0,c.height,0,0,c.width,0,c.width,c.height]), {src:t,pts:a,maxLength:l}
    }
    _update(){
        if(!this.options.element) return;
        let t = this.options.bounds;
        if((t instanceof mapboxgl.LngLatBounds && (t=t.toArray()) || (t.length === 2) ) && (t=[[t[0][0],t[0][1]],[t[0][0],t[1][1]],[t[1][0],t[1][1]],[t[1][0],t[0][1]]]),
        0==this.options.width||0==this.options.height) return;
        const e = this._adjustCoord([0,this.options.height || 0,0,0,this.options.width,0,this.options.width,this.options.height || 0],t),
        i= buildTransformerMatrix3d(e.src,e.pts);
       
        null != i && (this.options.element.style.transform=i),
        this.options.element.style.transformOrigin="0 0"
    }
}



export function DivOverlayTest() {
    const map = MxMapBox.getMap()
    const createDivOverlay = (ps:any) => {
        const imageWidth = 1280; // 图像宽
        const imageHeight = 905; // 图像高
        const image = document.createElement( "img" );
        image.style.position = "absolute"; // 有多个divoverlay时，一定要加定位，否则会导致其他绘制不对
        image.style.left = '0px';
        image.style.top = '0px';
        image.style.width = imageWidth + "px";
        image.style.height = imageHeight + "px";
        image.style.opacity = '0.8';
        image.style.zIndex = '-1';
        image.src = "https://t7.baidu.com/it/u=1819248061,230866778&fm=193&f=GIF"
        image.style.pointerEvents = "none"
    
        // 增加一个DIV的Image覆盖物
        const divOverlay = new DivOverlay({
            bounds: ps, // 四个点的位置
            element: image, // DIV 元素
            width: imageWidth,// DIV 宽
            height: imageHeight
        })
        divOverlay.addTo(map);
    }
    // 设置高度
    let height2 = 100, height1 = 300;
    // 得到地图范围
    const bounds = map.getBounds().toArray()
    let t = bounds
    const points1 = [
        [t[0][0],t[0][1], 0],[t[0][0],t[1][1], height1],[t[1][0],t[1][1],height1],[t[1][0],t[0][1], 0]
    ]
    const points2 = [
        [t[0][0],t[0][1], height2],[t[0][0],t[1][1], height2],[t[1][0],t[1][1],height2],[t[1][0],t[0][1],height2]
    ]
    createDivOverlay(points1)
    createDivOverlay(points2)
}

 