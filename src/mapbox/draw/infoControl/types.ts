///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


// 创建信息控件需要提供的参数
export interface InfoControlOptions  {
    distanceUnits?: 'kilometers' | 'miles' | 'none',
    drawControl: MapboxDraw
    editProperties?: {
        name: string,
        label?:string,
        type?: string
        [x:string]: any
    }[]
    editActions?:  {
        className?: string,
        title?: string,
        handler: Function
    }[]
    defaultTitle?: string
}