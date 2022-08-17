///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import { IControl, Map } from "mapbox-gl"

// 扩展绘制控件按钮
type btnType = { classes?: string[]; on: string; action: (this: HTMLButtonElement, ev: any) => any; elButton?: HTMLButtonElement; title?: string }
type chackBtnType = {
    elCheckbox?: HTMLInputElement;
    initialState?: string
    title?: string
    classes: string[]
    on: string
    action: EventListenerOrEventListenerObject
}

// 绘制控件工具条
class ExtendDrawBar implements IControl {
    draw!: MapboxDraw;
    buttons!: btnType[];
    chekcBtns!: chackBtnType[];
    onAddOrig!: Function;
    onRemoveOrig!: Function;
    map!: Map;
    elContainer!: HTMLElement;
    constructor(opt: { draw: MapboxDraw; buttons?: btnType[]; chekcBtns?: chackBtnType[] }) {
        let ctrl = this;
        ctrl.draw = opt.draw;
        ctrl.buttons = opt.buttons || [];
        ctrl.chekcBtns = opt.chekcBtns || [];
        ctrl.onAddOrig = opt.draw.onAdd;
        ctrl.onRemoveOrig = opt.draw.onRemove;
    }
    onAdd(map: Map) {
        let ctrl = this;
        ctrl.map = map;
        ctrl.elContainer = ctrl.onAddOrig(map);
        // 普通按钮
        ctrl.buttons.forEach((b) => {
            ctrl.addButton(b);
        });
        // input开关按钮
        ctrl.chekcBtns.forEach((b) => {
            ctrl.addCheckbox(b);
        });
        return ctrl.elContainer;
    }
    onRemove(map: Map) {
        let ctrl = this;
        ctrl.buttons.forEach((b) => {
            ctrl.removeButton(b);
        });
        ctrl.chekcBtns.forEach((b) => {
            ctrl.removeCheckButton(b);


        });
        ctrl.onRemoveOrig(map);
    }
    // 添加普通按钮
    addButton(opt: btnType) {
        let ctrl = this;
        var elButton = document.createElement('button');
        elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
        if (opt.classes instanceof Array) {
            opt.classes.forEach((c) => {
                elButton.classList.add(c);
            });
        }
        elButton.setAttribute("title", opt.title || opt.on);
        elButton.addEventListener(opt.on, opt.action);
        ctrl.elContainer.appendChild(elButton);
        opt.elButton = elButton;
    }
    // 添加开关按钮
    addCheckbox(opt: chackBtnType) {
        let ctrl = this;
        const elCheckbox = document.createElement("input");
        elCheckbox.setAttribute("type", "checkbox");
        elCheckbox.setAttribute("title", opt.title || '');
        elCheckbox.checked = opt.initialState === "checked";
        elCheckbox.className = "mapbox-gl-draw_ctrl-draw-btn";
        if (opt.classes instanceof Array) {
            opt.classes.forEach((c) => {
                elCheckbox.classList.add(c);
            });
        }
        elCheckbox.addEventListener(opt.on, opt.action);
        ctrl.elContainer.appendChild(elCheckbox);
        opt.elCheckbox = elCheckbox;
    }
    removeButton(opt: btnType) {
        if (!opt.elButton) {
            return
        }
        opt.elButton.removeEventListener(opt.on, opt.action);
        opt.elButton.remove();
    }
    removeCheckButton(opt: chackBtnType) {
        opt.elCheckbox && opt.elCheckbox.removeEventListener(opt.on, opt.action);
        opt.elCheckbox && opt.elCheckbox.remove();
    }
}

export default ExtendDrawBar