import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'github-markdown-css/github-markdown.css'
import { createPinia } from 'pinia'

import { marked } from 'marked'
marked.setOptions({
  breaks: true,
  gfm: true
})

// ✅ 引入 vue-echarts 和 echarts 模块
import VueECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'

// ✅ 注册 echarts 模块
use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 启动 Vue 应用
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.component('v-chart', VueECharts)
app.mount('#app')
