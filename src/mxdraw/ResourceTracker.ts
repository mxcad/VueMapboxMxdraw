///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////


// three 资源追踪
export class ResourceTracker {
    resources:Set<any> = new Set();
    constructor() {
    }
    /**
     * @param resource 所有的mesh、geometry、texture、object3D、外部加载的obj模型、gltf模型等等需要add to scene的物体
     * */ 
    track(resource:any) {
        if (!resource) {
            return resource;
        }
        // 处理children 是 一组材质material 时， 或者是纹理是数组时
        if (Array.isArray(resource)) {
            resource.forEach(resource => this.track(resource));
            return resource;
        }
        if (resource.dispose || (resource&&resource.isObject3D)) {
            // 添加对象
            this.resources.add(resource);
        }
       
        if ((resource && resource.isObject3D)) {
            this.track((resource as any).geometry);
            this.track((resource as any).material);
            this.track(resource.children);
        }
        else if (resource && resource.isMaterial) {
            // 检查一下材料上是否有纹理
            for (const value of Object.values<any>(resource)) {
                if (value && value.isTexture) {
                    this.track(value);
                }
            }

            // 必须检查是否任何uniforms 纹理textures 或纹理数组
            if ((resource as any).uniforms) {
                for (const value of Object.values<any>((resource as any).uniforms)) {
                    if (value) {
                        const uniformValue = value.value;
                        if ((uniformValue && value.isTexture) ||
                            Array.isArray(uniformValue)) {
                            this.track(uniformValue);
                        }
                    }
                }
            }
        }
        return resource;
    }
    // 删除对象
    untrack(resource:any) {
        this.resources.delete(resource);
    }

    dispose() {
        for (const resource of this.resources) {
            if (resource && resource.isObject3D) {
                this.removeObj(resource)
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }
            if (resource.dispose) {
                resource.dispose();
            }
        }
        this.resources.clear()
    }
    clearCache(item:any) {
        item.geometry && item.geometry.dispose && item.geometry.dispose();
        item.material && item.material.dispose && item.material.dispose();
    };
    removeObj(obj:any) {
        let arr = obj.children.filter((x:any) => x);
        arr.forEach((item:any) => {
          if (item.children.length) {
            this.removeObj(item);
          } else {
            this.clearCache(item);
            item.clear && item.clear();
          }
        });
        obj.clear && obj.clear();
        arr = null;
    }
}
const resourceTracker = new ResourceTracker()
export default resourceTracker