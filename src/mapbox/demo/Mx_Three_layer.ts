///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { randomPonit } from "@/mxthree/utils";
import { GUI } from "dat.gui";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { MxMapBox } from "../init";

// three.js的图层应用
export default function() {
	let map = MxMapBox.getMap();
    const draw = MxFun.getCurrentDraw()
    const camera = draw.getCamera()
	// 颜色
    const colors = [ 0xff0000, 0x00ff00, 0x0000ff ];
	const geometry = new THREE.BoxGeometry( 20000, 20000, 20000 );
	// 生成随机的几何体网格
	for ( let i = 0; i < 300; i ++ ) {
		// 控制图层
		const layer = ( i % 3 );

		const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: colors[ layer ] } ) );
		object.position.copy(randomPonit())
		// object.position.x = Math.random() * 800 - 400;
		// object.position.y = Math.random() * 800 - 400;
		// object.position.z = Math.random() * 800 - 400;

		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;

		object.scale.x = Math.random() + 0.5;
		object.scale.y = Math.random() + 0.5;
		object.scale.z = Math.random() + 0.5;

		object.layers.set( layer );
	
		draw.addObject(object)
	}
	// 图层控制面板
	const layers = {

		'toggle red': function () {
			// 切换相机的图层
			camera.layers.toggle( 0 );

		},

		'toggle green': function () {

			camera.layers.toggle( 1 );

		},

		'toggle blue': function () {

			camera.layers.toggle( 2 );

		},

		'enable all': function () {

			camera.layers.enableAll();

		},

		'disable all': function () {

			camera.layers.disableAll();

		}

	};

	// Init gui
	const gui = new GUI();
	gui.add( layers, 'toggle red' );
	gui.add( layers, 'toggle green' );
	gui.add( layers, 'toggle blue' );
	gui.add( layers, 'enable all' );
	gui.add( layers, 'disable all' );
	map.once('remove', ()=> {
		gui.domElement.remove()
	})
}