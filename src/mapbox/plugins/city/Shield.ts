import * as THREE from 'three';


const Shader1 = {
    vertexShader: `
        varying vec3 vNormal;
        void main()
        {
        vNormal = normalize( normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }

    `,
    fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 u_color;
        void main()
        {
        vec3 z = vec3(0.0, 0.0, 1);
        float x = abs(dot(vNormal, z));
        float alpha = pow( 1.0 - x, 2.0 );
        gl_FragColor = vec4( u_color, alpha );
        }
    `
    
}

export function Shield1() {
    const geometry = new THREE.SphereGeometry( 40, 100, 100 ,0,Math.PI * 2,0,Math.PI/2);
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_color: {
                value: new THREE.Color('#ff0000')
            }
        },
    
        depthFunc: 3,
        depthTest: true,
        depthWrite: false,
        dithering: false,
        side: 4,    
        vertexShader: Shader1.vertexShader,
        fragmentShader: Shader1.fragmentShader
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(1000)
    mesh.rotation.set(Math.PI / 2, 0, -0)

    let scale = 1000
    const clock = new THREE.Clock()
    let isStart = false
    mesh.userData.animate = () => {
        if (!isStart) return
        
        if(scale > 1000) {
            scale = 300
        }else {
            scale += 10
        }
        mesh.scale.setScalar(scale)
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
    console.log(mesh)
    return mesh
}


const Shader = {
    vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    varying vec2 vUv;
    void main() 
    {
        vUv = uv;
        vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
        vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform vec3 glowColor;
    uniform float bias;
    uniform float power;
    uniform float scale;
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    uniform sampler2D textureMap;
    uniform vec2 repeat;
    varying vec2 vUv;
    uniform float time;
    void main() 
    {
        float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
        //*(vec2(1.0,time))
        vec4 mapColor=texture2D( textureMap, vUv*repeat);
        // * mapColor.rgb
        gl_FragColor = vec4( glowColor, a);
    }`
}
export default function (texture: any) {

    const geometry = new THREE.SphereGeometry( 40, 100, 100 ,0,Math.PI * 2,0,Math.PI/2);
   
    const material = new THREE.ShaderMaterial({
        uniforms: {
            scale:   { type: "f", value: 0.4},
            bias:   { type: "f", value: 0.4},
            power:   { type: "f", value: 3.3 },
            glowColor: { type: "c", value: new THREE.Color(0xff0000) },
            textureMap: {
                value: texture
            },
            repeat:{
                type:"v2",
                value: new THREE.Vector2(30.0,15.0)
            },
            time:{
                value: 0.0
            }
        },
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexShader: Shader.vertexShader,
        fragmentShader: Shader.fragmentShader
    })
 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(1000)
    mesh.rotateX(Math.PI / 2 ) 

    let scale = 1000
    const clock = new THREE.Clock()
    let isStart = false
    mesh.userData.animate = () => {
        if (!isStart) return
        
        if(scale > 1000) {
            scale = 300
        }else {
            scale += 10
        }
        mesh.scale.setScalar(scale)
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
    return mesh
}