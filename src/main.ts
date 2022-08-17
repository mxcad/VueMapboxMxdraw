import Vue, { createApp } from 'vue'
import App from './App.vue'

// ElementUI组件引入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入各种自定义点标记的样式
import "./mapbox/pointTag/index.css"
const app = createApp(App)
app.use(ElementPlus)

// 注册ElementUI icons 图标全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')
