///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


// 创建历史记录对象
export default class Record {
    type: number;
    action: number;
    features: any[];
    prevFeatures: any[];
    constructor(type = 0, action = 0, features = [], prevFeatures = []) {
        this.type = type;
        this.action = action;
        this.features = features;
        this.prevFeatures = prevFeatures;
    }
    getType() {
        return this.type;
    }
    getAction() {
        return this.action;
    }
    getFeatures() {
        return this.features;
    }
    getPrevFeatures() {
        return this.prevFeatures;
    }
}