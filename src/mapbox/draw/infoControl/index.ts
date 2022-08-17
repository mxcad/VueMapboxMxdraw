///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


import "./index.css"
import { BaseInfoControl, BaseEditableInfoControl } from '@wabson/mapbox-gl-feature-info';
// 重写图形信息控件基础类的方法
BaseInfoControl.prototype.getFeatureName = function(feature:any, state:any=null) {
    if(!state) {
        const control = this.drawControl.get(feature.id)
        if(control) {
            state = control.properties;
        }  
    }
    return state ? state.name : null;
}

// 添加到地图 生成信息展示的元素
BaseEditableInfoControl.prototype.onAdd = function(map:any) {
    const container = BaseInfoControl.prototype.onAdd.call(this, map);

    this._editContainer = document.createElement('div');
    this._editContainer.className = 'edit-ctrl';
    this._editContainer.innerHTML = '<div class="edit-tools">' +
        this.editToolbarHtml() + '</div>' +
        '<div class="edit-form">' +
        this.editProperties.map((prop:any) => `<div><label>${prop.label}: 
        <input ${(prop.min && prop.type === 'number') ? 'min=' + ((prop.name === "_opacity") ? 0 : prop.min) : ((prop.name === "_opacity") ? 'min="0"': '') }  
        ${(prop.max && prop.type === 'number') ? 'max=' + ((prop.name === "_opacity") ? 1 : prop.max) : ((prop.name === "_opacity") ? 'max="1"': '') }
        ${(prop.step && prop.type === 'number') ? 'step=' + ((prop.name === "_opacity") ? 0.1 : prop.step) : ((prop.name === "_opacity") ? 'step="0.1"': '') }
        type="${prop.type || 'text'}" name="${prop.name}"></label></div>`).join('') +
        '<div><button type="button" data-btn-action="ok">OK</button><button type="button" data-btn-action="cancel">Cancel</button></div></div>';
    this._container.appendChild(this._editContainer);

    this.registerDomEvents();
    return container;
}

// 显示可编辑的表单(图形的属性)
BaseEditableInfoControl.prototype.showEditForm = function() {
    this._editContainer.querySelector('.edit-form').style.display = 'block';
    const firstPropertyInputs = this._editContainer.querySelectorAll('input');
    const selectedFeature = this.drawControl.getSelected().features[0];
    if(selectedFeature && selectedFeature.properties) {
        firstPropertyInputs.forEach((inputEl:any)=> {
            const value = selectedFeature.properties[inputEl.name]
           if(value) inputEl.value = value.toString()
        })
    }
   
    if (firstPropertyInputs.length > 0) {
        firstPropertyInputs[0].focus();
    }
}
// 保存可编辑的表单(修改图形的属性)
BaseEditableInfoControl.prototype.saveEditForm = function() {
    const selectedFeatures = this.drawControl.getSelected().features;
    for (const inputEl of this._editContainer.querySelectorAll('input')) {
        for (const feature of selectedFeatures) {
            if( inputEl.value !== '') {
                this.drawControl.setFeatureProperty(feature.id, inputEl.name, inputEl.type === "number" ? Number(inputEl.value) : inputEl.value);
            }
        }
    }
    this._map.triggerRepaint()
    this.setFeaturesText(selectedFeatures);
}

export * from "./PolygonInfoControl";
export * from "./LineStringInfoControl";
export * from "./PointInfoControl";
export * from "./TextInfoControl";