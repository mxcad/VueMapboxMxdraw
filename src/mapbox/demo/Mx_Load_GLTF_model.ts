///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import resourceTracker from "@/mxdraw/ResourceTracker";
import { GUI, GUIController } from "dat.gui";
import { MxFun } from "mxdraw";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { MxMapBox } from "../init";
// 模型动画
export default async function () {
    let map = MxMapBox.getMap();
    const draw = MxFun.getCurrentDraw()
    let model: THREE.Object3D, skeleton: THREE.Object3D, mixer: THREE.AnimationMixer, clock = new THREE.Clock()

    let panel = new GUI({ width: 310 });
    const crossFadeControls: any[] = [];

    let idleAction: THREE.AnimationAction, walkAction: THREE.AnimationAction, runAction: THREE.AnimationAction;
    let idleWeight: number, walkWeight: number, runWeight: number;
    let actions: any[], settings:{[x:string]:any};

    let singleStepMode = false;
    let sizeOfNextStep = 0;
    // GLTF 模型加载器
    const loader = new GLTFLoader();
    // 拿到地图数据
    const data = await fetch('./demo/mapcad.dwg.json')
    const {  borderWireFrame } =  JSON.parse(await data.text());
    // 获取边框的点数据
    const borderPoints = borderWireFrame.map((pt:{x:number,y:number, z:number})=> {
        return new THREE.Vector3( pt.x, pt.y, pt.z)
    })
    // 计算图纸的中点
    const centerPoint = new THREE.Box3().setFromPoints(borderPoints).getCenter(new THREE.Vector3())
    // 加载模型
    loader.load('./model/Soldier.glb', function (gltf) {
        model = gltf.scene
        // 放大
        model.scale.setScalar(100000)
        // 调整旋转角度
        model.rotateX(Math.PI / 2)
        model.rotateY(Math.PI)
        // 设置位置
        model.position.copy(centerPoint)
        // 添加光线
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444) ;
        model.add(hemiLight)
        // 添加模型
        draw.addObject(model)
        
        model.traverse(function (object) {
            if((object as THREE.Mesh).isMesh) object.castShadow = true;
        });

        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        draw.addObject(skeleton)

        // 创建控制机器人的面板
        createPanel();

        // 拿到模型的动画
        const animations = gltf.animations;
        // 动画帧
        mixer = new THREE.AnimationMixer(model);
        idleAction = mixer.clipAction(animations[0]);
        walkAction = mixer.clipAction(animations[3]);
        runAction = mixer.clipAction(animations[1]);

        actions = [idleAction, walkAction, runAction];

        activateAllActions();

        animate();

    });

    function createPanel() {
        const folder1 = panel.addFolder('Visibility');
        const folder2 = panel.addFolder('Activation/Deactivation');
        const folder3 = panel.addFolder('Pausing/Stepping');
        const folder4 = panel.addFolder('Crossfading');
        const folder5 = panel.addFolder('Blend Weights');
        const folder6 = panel.addFolder('General Speed');

        settings = {
            'show model': true,
            'show skeleton': false,
            'deactivate all': deactivateAllActions,
            'activate all': activateAllActions,
            'pause/continue': pauseContinue,
            'make single step': toSingleStepMode,
            'modify step size': 0.05,
            'from walk to idle': function () {

                prepareCrossFade(walkAction, idleAction, 1.0);

            },
            'from idle to walk': function () {

                prepareCrossFade(idleAction, walkAction, 0.5);

            },
            'from walk to run': function () {

                prepareCrossFade(walkAction, runAction, 2.5);

            },
            'from run to walk': function () {

                prepareCrossFade(runAction, walkAction, 5.0);

            },
            'use default duration': true,
            'set custom duration': 3.5,
            'modify idle weight': 0.0,
            'modify walk weight': 1.0,
            'modify run weight': 0.0,
            'modify time scale': 1.0
        };

        folder1.add(settings, 'show model').onChange(showModel);
        folder1.add(settings, 'show skeleton').onChange(showSkeleton);
        folder2.add(settings, 'deactivate all');
        folder2.add(settings, 'activate all');
        folder3.add(settings, 'pause/continue');
        folder3.add(settings, 'make single step');
        folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);
        crossFadeControls.push(folder4.add(settings, 'from walk to idle'));
        crossFadeControls.push(folder4.add(settings, 'from idle to walk'));
        crossFadeControls.push(folder4.add(settings, 'from walk to run'));
        crossFadeControls.push(folder4.add(settings, 'from run to walk'));
        folder4.add(settings, 'use default duration');
        folder4.add(settings, 'set custom duration', 0, 10, 0.01);
        folder5.add(settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

            setWeight(idleAction, weight);

        });
        folder5.add(settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

            setWeight(walkAction, weight);

        });
        folder5.add(settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

            setWeight(runAction, weight);

        });
        folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

    }

    // 显示模型
    function showModel(visibility: boolean) {

        model.visible = visibility;

    }

    // 显示骨架
    function showSkeleton(visibility: boolean) {

        skeleton.visible = visibility;

    }

    // 缩放
    function modifyTimeScale(speed: number) {

        mixer.timeScale = speed;

    }

    // 静止所有操作
    function deactivateAllActions() {

        actions.forEach(function (action) {

            action.stop();

        });

    }
    // 激活所有动作
    function activateAllActions() {

        setWeight(idleAction, settings['modify idle weight']);
        setWeight(walkAction, settings['modify walk weight']);
        setWeight(runAction, settings['modify run weight']);

        actions.forEach(function (action) {

            action.play();

        });

    }

    // 暂停继续
    function pauseContinue() {

        if (singleStepMode) {

            singleStepMode = false;
            unPauseAllActions();

        } else {

            if (idleAction.paused) {

                unPauseAllActions();

            } else {

                pauseAllActions();

            }

        }

    }
    // 暂停所有动作
    function pauseAllActions() {

        actions.forEach(function (action) {

            action.paused = true;

        });

    }
    // 取消暂停所有动作
    function unPauseAllActions() {

        actions.forEach(function (action) {

            action.paused = false;

        });

    }
    // 单步模式
    function toSingleStepMode() {

        unPauseAllActions();

        singleStepMode = true;
        sizeOfNextStep = settings['modify step size'];

    }

    // 准备交叉混合
    function prepareCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, defaultDuration: number) {

        // Switch default / custom crossfade duration (according to the user's choice)

        const duration = setCrossFadeDuration(defaultDuration);

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

        singleStepMode = false;
        unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop

        if (startAction === idleAction) {

            executeCrossFade(startAction, endAction, duration);

        } else {

            synchronizeCrossFade(startAction, endAction, duration);

        }

    }
    // 设置交叉渐隐持续时间
    function setCrossFadeDuration(defaultDuration: number) {

        // Switch default crossfade duration <-> custom crossfade duration

        if (settings['use default duration']) {

            return defaultDuration;

        } else {

            return settings['set custom duration'];

        }

    }

    // 同步交叉混合
    function synchronizeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: any) {
        function onLoopFinished(event: any) {

            if (event.action === startAction) {

                mixer.removeEventListener('loop', onLoopFinished);

                executeCrossFade(startAction, endAction, duration);

            }

        }

        mixer.addEventListener('loop', onLoopFinished);

       

    }

    // 执行交叉混合
    function executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: any) {

        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)

        setWeight(endAction, 1);
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false

        startAction.crossFadeTo(endAction, duration, true);

    }

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))
    // 设置权重
    function setWeight(action: THREE.AnimationAction, weight: number) {

        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);

    }

    // Called by the render loop
    // 更新重量滑块
    function updateWeightSliders() {

        settings['modify idle weight'] = idleWeight;
        settings['modify walk weight'] = walkWeight;
        settings['modify run weight'] = runWeight;

    }

 
    // 动画函数
    function animate() {

        // Render loop

        requestAnimationFrame(animate);

        idleWeight = idleAction.getEffectiveWeight();
        walkWeight = walkAction.getEffectiveWeight();
        runWeight = runAction.getEffectiveWeight();

        // Update the panel values if weights are modified from "outside" (by crossfadings)

        updateWeightSliders();

        // Enable/disable crossfade controls according to current weight values

        // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

        let mixerUpdateDelta = clock.getDelta();

        // If in single step mode, make one step and then do nothing (until the user clicks again)

        if (singleStepMode) {

            mixerUpdateDelta = sizeOfNextStep;
            sizeOfNextStep = 0;

        }

        // Update the animation mixer, the stats panel, and render this frame

        mixer.update(mixerUpdateDelta);

        draw.updateDisplay()

    }
    map.once('remove', ()=> {
        panel.domElement.remove()
    })
}

