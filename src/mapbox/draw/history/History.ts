///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////

import Record from "./Record"

// 历史记录类
export default class History {
    cursor: number;
    recordes: Record[];
    constructor() {
        this.cursor = -1;
        this.recordes = [];
    }
    // 添加记录
    addRecord(record: Record) {
        if (record) {
            if (this.cursor + 1 < this.recordes.length) {
                this.recordes = this.recordes.slice(0, this.cursor + 1);
            }
            this.recordes.push(record);
            const len = this.recordes.length;
            this.cursor = len - 1;
        }
        return this;
    }

    // 取消记录
    undoRecord() {
        let len = this.recordes.length;
        let record = null;
        if (len === 0) {
            this.cursor = -1;
        } else if (len > 0 && this.cursor > -1) {
            record = this.recordes[this.cursor];
            this.cursor = this.cursor - 1;
        }
        return record;
    }
    redoRecord() {
        let len = this.recordes.length;
        let record = null;
        if (len === 0) {
            this.cursor = -1;
        }
        if (len > 0 && this.cursor < len - 1) {
            record = this.recordes[this.cursor + 1];
            this.cursor = this.cursor + 1;
        }
        return record;
    }
    // 获取当前记录
    getCurrentRecord() {
        let len = this.recordes.length;
        let record = null;
        if (len === 0) {
            return null;
        }
        if (this.cursor > -1 && this.cursor < len) {
            record = this.recordes[this.cursor];
        }
        return record;
    }
    // 获取所有记录
    getAllRecords() {
        return this.recordes;
    }
    // 清空记录
    clear() {
        this.cursor = -1;
        this.recordes = [];
    }
}