
import { MxMapBox } from "../init"
import { Map } from "../Map";
import mapboxgl from "mapbox-gl"
import * as turf from "@turf/turf"
export function webGlLayer() {
    const map = MxMapBox.getMap()
    const bounds = map.getBounds().toArray()
    const bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as turf.helpers.BBox
    console.log(bbox)
    class CustomWebGlLayer {
        id: string;
        type: 'custom';
        renderingMode: '3d';
        program!: WebGLProgram;
        buffer!: WebGLBuffer | null;
        aPos!: number;
        constructor() {
            this.id = 'customLayer';
            this.type = 'custom';
            this.renderingMode = '3d';
        }
    
        onAdd(map: Map, gl: WebGL2RenderingContext) {
    
            //定义着色器代码
            const vertexSource = `uniform mat4 u_matrix;
                        attribute vec2 a_pos;
                        void main() {
                            gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
                        }`;
            const fragmentSource = `void main() {
                            gl_FragColor = vec4(1.0, 1.0, 0.0, 0.8);
                        }`;
    
            // create a vertex shader
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            if(!vertexShader)  return;
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);
    
            // create a fragment shader
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            if(!fragmentShader) return;
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);
    
            // link the two shaders into a WebGL program
            this.program = gl.createProgram() as WebGLProgram;
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
    
            //将三角形经纬度点转墨卡托投影，墨卡托坐标转webgl裁剪坐标系的转换矩阵
            const pt1 = mapboxgl.MercatorCoordinate.fromLngLat(turf.randomPosition(bbox) as [number, number]);
            const pt2 = mapboxgl.MercatorCoordinate.fromLngLat(turf.randomPosition(bbox) as [number, number]);
            const pt3 = mapboxgl.MercatorCoordinate.fromLngLat(turf.randomPosition(bbox) as [number, number]);
    
    
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    pt1.x,
                    pt1.y,
                    pt2.x,
                    pt2.y,
                    pt3.x,
                    pt3.y
                ]),
                gl.STATIC_DRAW
            );
        }
    
        render(gl:WebGL2RenderingContext, matrix: number[]) {
            gl.useProgram(this.program);
            gl.uniformMatrix4fv(
                gl.getUniformLocation(this.program, 'u_matrix'),
                false,
                matrix
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.enableVertexAttribArray(this.aPos);
            gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        }
    
        onRemove() {
    
        }
    }
   
    map.addLayer(new CustomWebGlLayer());
}