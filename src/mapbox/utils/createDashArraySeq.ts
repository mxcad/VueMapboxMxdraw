///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////    
    
    
    // 创建虚线缓冲数组
    export function createDashArraySeq(dash: number[], speed = 1) {
        let dashArraySeq = [dash];
        for (let i = speed, len = dash[0] + dash[1]; i < len; i += speed) {
            const arr = [];
            if (i <= len - dash[0]) {
                arr.push(0, i, dash[0], dash[1] - i);
            } else {
                const leftFillCnt = i - (len - dash[0]);
                arr.push(leftFillCnt, dash[1], dash[0] - leftFillCnt, 0);
            }
            dashArraySeq.push(arr);
        }
        return dashArraySeq;
    }