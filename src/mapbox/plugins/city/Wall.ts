
import * as THREE from 'three';

interface WallPathOptionType {
    height?:number;
    path?:any[];
    materials?:any[];
    expand?:boolean
}
export function creatWallByPath({
    height = 10,
    path = new Array(),
    materials = createFlowWallMat({}),
    expand = true }: WallPathOptionType) {

    let verticesByTwo: any[];
    // 1.处理路径数据  每两个顶点为为一组
    if (expand) {
        // 1.1向y方向拉伸顶点
        verticesByTwo = path.reduce((arr, [x, y, z]) => {
            return arr.concat([
                [
                    [x, z, y],
                    [x, z - height, y],
                ],
            ]);
        }, []);
    } else {
        // 1.2 已经处理好路径数据
        verticesByTwo = path;
    }

    // 2.解析需要渲染的四边形 每4个顶点为一组
    const verticesByFour = verticesByTwo.reduce((arr, item, i) => {
        if (i === verticesByTwo.length - 1) return arr;
        return arr.concat([[item, verticesByTwo[i + 1]]]);
    }, []);

    // 3.将四边形面转换为需要渲染的三顶点面
    const verticesByThree = verticesByFour.reduce((arr: string | any[], item: [[any, any], [any, any]]) => {
        const [[point1, point2], [point3, point4]] = item;
        return arr.concat(
            ...point2,
            ...point1,
            ...point4,
            ...point1,
            ...point3,
            ...point4
        );
    }, []);
    const geometry = new THREE.BufferGeometry();
    // 4. 设置position
    const vertices = new Float32Array(verticesByThree);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]

    // 5.1 以18个顶点为单位分组
    const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
        .fill(0)
        .map((item, i) => {
            return verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6);
        });
    // 5.2 按uv周期分组
    const pointsGroupBy63:any = pointsGroupBy18.map((item, i) => {
        return new Array(item.length / 3)
            .fill(0)
            .map((it, i) => item.slice(i * 3, (i + 1) * 3));
    });

    // 5.3根据BoundingBox确定uv平铺范围
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const rangeX = max.x - min.x;
    const uvs = [].concat(
        ...pointsGroupBy63.map((item: any[]) => {
            const point0 = item[0];
            const point5 = item[5];
            let distance =
                new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) /
                (rangeX);
            return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
        })
    );
    geometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    geometry.rotateX(Math.PI * 1.5)
    
    const mesh = new THREE.Mesh(geometry, materials[0]);      
    const meshLine = new THREE.Mesh(geometry, materials[1])

    materials[1].map.repeat.set(1,3);
    const group = new THREE.Group().add(mesh, meshLine)
    
    let time = 0
    const clock = new THREE.Clock()
    let isStart = false
    group.userData.animate = () => {
        if (!isStart) return
        time += clock.getDelta();
        if(time > 1) {
            time = 0
        }
        (meshLine.material as any).map.offset = new THREE.Vector2(-time,0);
        return group.userData.animate
    }
    
   


    group.userData.animate.start = () => {
        clock.start()
        isStart = true
        return group.userData.animate
    }
    group.userData.animate.stop = () => {
        clock.stop()
        isStart = false
        return group.userData.animate
    }
    return group
}

/**
 * 创建流体墙体材质
 * option =>
 * params bgUrl flowUrl
 * **/
export function createFlowWallMat({ bgUrl, flowUrl }:any) {
    const bgTexture = new THREE.TextureLoader().load(
      bgUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAABACAYAAABsv8+/AAAAAXNSR0IArs4c6QAABHhJREFUeF7t2C9oVWEYx/Hz7m44RESGiCAiIiKCiBhMJpPJZDKZTCaTyWQxmUwmk8lkMplMJpPJJAyDGxa33d0/Rx4u91o2k2Hc32dlXJa+n/ueZ895W9/3rfNDgAABAgQIRAm0vu8HUcViCRAgQIAAga4WgDUOBAgQIECAQJZALQDHspLVEiBAgAABAm1zc/M4BgIECBAgQCBLoG4ATmQlqyVAgAABAgTa1tbWyY2NjYXE9vZ25zOP+YFwHjwP5oF5YB7MBJZtHtYNwCl7EAECBAgQIJAlUAvA3/U2q10tAQIECBCIFagF4HRsvXACBAgQIBAqUAvAmdB22QQIECBAIFagFoCzsfXCCRAgQIBAqEDb2dk5F9oumwABAgQIxArUDcD52HrhBAgQIEAgVKDt7u5eWF9fX+Tv7e11PvOYHwjnwfNgHpgH5sFMYNnmYd0AXAxdfmQTIECAAIFYgVoALsXWCydAgAABAqECtQBcDm2XTYAAAQIEYgVqAbgSWy+cAAECBAiECtQCcDW0XTYBAgQIEIgVaMPh8FpsvXACBAgQIBAqUDcA10PbZRMgQIAAgViBtr+/f2NtbW0BMBqNOp95zA+E8+B5MA/MA/NgJrBs87BuAG7Grj/CCRAgQIBAqEDdANyy4dvwbfjLueEv2xuLHjdS/l/9v/9XdQNwO3T5kU2AAAECBGIF2mg0urO6unoowHg87vydz2EHxPnwfJgP5oP5cLDAUZ+PdQNwN3b9EU6AAAECBEIF2ng8vjcYDLrJZNL5zcE58ByYA+aAOZAxB+oG4H7o8iObAAECBAjECtQNwIODNv65yGGboL/PBPgcvCk7H86H58N8MB+P9nysG4CHseuPcAIECBAgECrQJpPJo3n7yspKN51OFxQ+83AePA/mw0zAPDQPl20e1g3A49DlRzYBAgQIEIgVqBuAJzZ8G743HG943nC94S7bG66ef99g1g3A09j1RzgBAgQIEAgVqBuAZ6HtsgkQIECAQKxA3QA8j60XToAAAQIEQgVqAXgR2i6bAAECBAjECtQC8DK2XjgBAgQIEAgVqAXgVWi7bAIECBAgECtQC8Dr2HrhBAgQIEAgVKAWgDeh7bIJECBAgECsQC0Ab2PrhRMgQIAAgVCBWgDehbbLJkCAAAECsQK1ALyPrRdOgAABAgRCBWoB+BDaLpsAAQIECMQK1ALwMbZeOAECBAgQCBWoBeBTaLtsAgQIECAQK1ALwOfYeuEECBAgQCBUoBaAL6HtsgkQIECAQKxALQBfY+uFEyBAgACBUIFaAL6FtssmQIAAAQKxArUAfI+tF06AAAECBEIFagH4EdoumwABAgQIxArUAvAztl44AQIECBAIFagF4Fdou2wCBAgQIBArUAvA79h64QQIECBAIFSgTafTYWut6/u+85uDc+A5MAfMAXMgYw7UDcAkdPmRTYAAAQIEYgVqAehj64UTIECAAIFQAQtA6BcvmwABAgSyBSwA2d+/egIECBAIFbAAhH7xsgkQIEAgW+APFN2+lgA54G0AAAAASUVORK5CYII="
    );
    const flowTexture = new THREE.TextureLoader().load(
      flowUrl ||
        "data:image/png;base64,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"
    );
    // 允许平铺
    
    flowTexture.wrapS = THREE.RepeatWrapping;
    flowTexture.wrapT = THREE.RepeatWrapping;
    flowTexture.encoding = 3000
    flowTexture.flipY = true
    flowTexture.format = 1023
    flowTexture.generateMipmaps = true
    // uv两个方向纹理重复数量
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        map: bgTexture,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        transparent:true,
    })
    const material1 = new THREE.MeshBasicMaterial({
        color: 0x5c00ff,
        map: flowTexture,
        depthTest: true,
        depthWrite: false,
        transparent:true,
        side: THREE.DoubleSide,
        opacity: 1
    })

    return [material, material1]
  };




const vertexShader = `
uniform vec3 u_color;

uniform float time;
uniform float u_height;
 
varying float v_opacity;

void main() {

    vec3 vPosition = position * mod(time, 1.0);

    v_opacity = mix(1.0, 0.0, position.y / u_height);
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;
const fragmentShader = ` 
uniform vec3 u_color;
uniform float u_opacity;
 
varying float v_opacity;

void main() { 
    gl_FragColor = vec4(u_color, v_opacity * u_opacity);
}
`;

interface OptionType {
    radius?: number
    height?: number
    opacity?: number
    color?: THREE.Color | string | number
    speed?: number
    renderOrder?: number
}


export default function (option: OptionType = {}) {
    const {
        radius,
        height = 1,
        opacity,
        color,
        speed,
        renderOrder,
    } = option;
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
    // const geometry  = new THREE.BoxGeometry( radius, radius, height );
    // const { geometry } = creatWallByPath({
    //     path: [[288759.000000, -46173.935285, 0],
    //     [883259.000000,  -46173.935285, 0 ],
    //     [883259.000000, 794826.064715, 0 ],
    //     [288759.000000, 794826.064715, 0],
    //     [288759.000000, -46173.935285, 0 ]]
    // })
    geometry.translate(0, height / 2, 0);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_height: {
                value: height
            },
            u_speed: {
                value: speed || 1
            },
            u_opacity: {
                value: opacity
            },
            u_color: {
                value: new THREE.Color(color)
            },
            time: {
                value: 0
            }
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = renderOrder || 1;
    let time = 0
    const clock = new THREE.Clock()
    let isStart = false
    mesh.userData.animate = () => {
        if (!isStart) return
        (mesh.material as THREE.ShaderMaterial).uniforms.time = { value: time += clock.getDelta() };
        return mesh.userData.animate
    }
    mesh.userData.animate.start = () => {
        clock.start()
        isStart = true
        return mesh.userData.animate
    }
    mesh.userData.animate.stop = () => {
        clock.stop()
        isStart = false
        return mesh.userData.animate
    }
    return mesh;
}