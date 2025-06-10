import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'github-markdown-css/github-markdown.css' // 添加Markdown样式
import { createPinia } from 'pinia'

// 配置marked
import { marked } from 'marked'
marked.setOptions({
  breaks: true,
  gfm: true
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')