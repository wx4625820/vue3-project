<template>
  <div class="resume-upload-wrapper">
    <h2>简历分析</h2>

    <div class="button-wrapper">
      <el-upload :show-file-list="false" :before-upload="beforeUpload" :http-request="handleUpload">
        <el-button class="teal-button">上传 PDF 简历</el-button>
      </el-upload>

      <el-button type="primary" :loading="analyzing" @click="analyze">一键分析</el-button>
      <el-button class="edit-button" @click="dialogVisible = true">编辑</el-button>
      <el-button type="danger" @click="resumeStore.clear()">删除简历</el-button>
      <el-button class="export-button" v-if="showExportButton" @click="exportPdf">导出报告</el-button>

    </div>




    <div class="contains-wrapper">
      <span class="contains">报告包含：</span> 基础信息、教育背景、工作经历、专业技能、行业对比
    </div>


    <!-- 分析维度卡片展示 -->
    <div class="card-wrapper">
      <div class="card-item" v-for="item in cardList" :key="item.index">
        <span class="card-index">{{ item.index }}</span>
        <span class="card-title">{{ item.title }}</span>
      </div>
    </div>

    <!-- 分析提示信息 -->
    <div class="card-tip">
      基于讯飞星火X1大语言模型，分析报告生成约需1分钟，预计消耗500token，中途请不要退出。
    </div>


    <el-input type="textarea" v-model="resumeText" placeholder="请输入或粘贴简历内容..." :rows="10" class="resume-textarea" />
    <el-card v-if="resultMarkdown" style="margin-top: 20px">
      <div class="markdown-body" v-html="renderedMarkdown" />
    </el-card>
    <div id="radar-chart" style="width: 100%; height: 400px; margin-top: 30px" v-if="showChart"></div>
    <el-dialog v-model="dialogVisible" title="编辑简历内容" width="700px">
      <el-input type="textarea" v-model="resumeText" :rows="20" style="width: 100%" />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { FullScreen, Delete } from '@element-plus/icons-vue'
import * as pdfjsLib from 'pdfjs-dist'
import * as echarts from 'echarts'
import { marked } from 'marked'
import { useResumeStore } from '@/stores/resumeStore'
import html2pdf from 'html2pdf.js'

const cardList = [
  { index: '一、', title: '基础信息' },
  { index: '二、', title: '教育背景' },
  { index: '三、', title: '工作经历' },
  { index: '四、', title: '专业技能' },
  { index: '五、', title: '行业对比' }
]
const showExportButton = ref(false)

const exportPdf = async () => {
  const chartDom = document.getElementById('radar-chart') as HTMLElement
  const chart = echarts.getInstanceByDom(chartDom)
  const chartImg = chart?.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' })

  if (!chartImg) {
    ElMessage.warning('雷达图尚未加载，无法导出报告')
    return
  }

  const markdownDiv = document.querySelector('.markdown-body')?.cloneNode(true) as HTMLElement
  if (!markdownDiv) {
    ElMessage.warning('报告内容为空，无法导出')
    return
  }

  // 创建一个离屏容器，避免干扰主页面
  const wrapper = document.createElement('div')
  wrapper.style.padding = '20px'
  wrapper.style.backgroundColor = '#fff'
  wrapper.style.fontFamily = 'Arial, sans-serif'
  wrapper.style.lineHeight = '1.6'
  wrapper.style.fontSize = '14px'

  // 添加 Markdown 内容
  markdownDiv.style.marginBottom = '20px'
  wrapper.appendChild(markdownDiv)

  // 添加雷达图图片
  const img = document.createElement('img')
  img.src = chartImg
  img.style.width = '100%'
  img.style.marginTop = '20px'
  wrapper.appendChild(img)

  // 使用 detached div，不挂载页面
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '-9999px'
  container.appendChild(wrapper)
  document.body.appendChild(container)

  await html2pdf().set({
    margin: 0.5,
    filename: `简历分析报告_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).from(wrapper).save()

  document.body.removeChild(container)
}




// 配置 marked
marked.setOptions({
  highlight: (code) => {
    return code
  },
  gfm: true,
  breaks: true,
  renderer: new marked.Renderer()
})

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const resumeStore = useResumeStore()
const resumeText = computed({
  get: () => resumeStore.text,
  set: (val) => resumeStore.setText(val),
})

const dialogVisible = ref(false)
const analyzing = ref(false)
const resultMarkdown = ref('')
const renderedMarkdown = ref('')
const showChart = ref(false)

const dimensionScores = ref<Record<string, number>>({
  基础信息: 0,
  教育背景: 0,
  工作经历: 0,
  专业技能: 0,
  行业对比: 0,
})

const beforeUpload = (file: File) => {
  if (!file.name.endsWith('.pdf')) {
    ElMessage.warning('仅支持上传 PDF 文件')
    return false
  }
  return true
}

const handleUpload = async (options: any) => {
  const file = options.file as File
  const reader = new FileReader()

  reader.onload = async () => {
    try {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer)
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const rawText = content.items.map((item: any) => (typeof item.str === 'string' ? item.str.trim() : '')).join(' ')
        const pageText = rawText
          .replace(/([\u3002\uff01\uff1f!?])(?=[^\n])/g, '$1\n')
          .replace(/([.!?])(?=\s+[A-Z])/g, '$1\n')
          .replace(/(\s{2,})/g, '\n')
        text += pageText + '\n\n'
      }
      resumeText.value = text.trim()
      ElMessage.success('解析成功')
    } catch (e) {
      console.error('PDF解析失败', e)
      ElMessage.error('解析 PDF 出错')
    }
  }

  reader.onerror = () => ElMessage.error('读取文件失败')
  reader.readAsArrayBuffer(file)
}

const analyze = async () => {
  if (!resumeText.value.trim()) {
    ElMessage.warning('请先输入简历内容')
    return
  }

  analyzing.value = true
  resultMarkdown.value = ''
  renderedMarkdown.value = ''
  showChart.value = false
  showExportButton.value = false  // 清空按钮状态

  try {
    const response = await fetch('/rag/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: resumeText.value }),
    })

    if (!response.body) {
      ElMessage.error('后端未返回内容')
      analyzing.value = false
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let renderTimer: number | null = null

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        resultMarkdown.value += chunk

        if (renderTimer) clearTimeout(renderTimer)
        renderTimer = window.setTimeout(() => {
          const raw = resultMarkdown.value
          const match = raw.match(/```markdown\s*([\s\S]*?)```/)
          const pureMarkdown = match ? match[1].trim() : raw
          renderedMarkdown.value = marked.parse(pureMarkdown)
        }, 80)

        await nextTick()
      }
    }

    resultMarkdown.value = resultMarkdown.value.replace(/```markdown\s*([\s\S]*?)```/, (_, content) => content.trim())
    renderedMarkdown.value = marked.parse(resultMarkdown.value)
    extractScores()
    showChart.value = true
    renderRadarChart()

    // ✅ 显示“导出报告”按钮
    showExportButton.value = true

  } catch (err) {
    console.error('analyze error:', err)
    ElMessage.error('分析失败，请稍后再试')
  } finally {
    analyzing.value = false
  }
}



const extractScores = () => {
  const markdown = resultMarkdown.value
  const dimensions = ['基础信息', '教育背景', '工作经历', '专业技能', '行业对比']
  dimensions.forEach((dim) => {
    const regex = new RegExp(`##\\s*${dim}[\\s\\S]*?-\\s*\\*\\*评分\\*\\*[:：]\\s*(\\d{1,3})`)
    const match = markdown.match(regex)
    if (match?.[1]) {
      dimensionScores.value[dim] = Number(match[1])
    }
  })
}

let myChart: echarts.ECharts | null = null

const renderRadarChart = async () => {
  await nextTick()
  const chartDom = document.getElementById('radar-chart')
  if (!chartDom) return

  if (myChart) {
    myChart.dispose() // 销毁旧图
  }

  myChart = echarts.init(chartDom)
  const option = {
    title: { text: '简历综合评分雷达图' },
    tooltip: {},
    radar: {
      indicator: Object.keys(dimensionScores.value).map(key => ({
        name: key,
        max: 100
      }))
    },
    series: [{
      type: 'radar',
      data: [{
        value: Object.values(dimensionScores.value),
        name: '评分'
      }]
    }]
  }
  myChart.setOption(option)
}

</script>

<style scoped>
.resume-upload-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.icon-button {
  background-color: #f0f2f5;
  color: #333;
}

.icon-button.danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.resume-textarea {
  width: 100%;
  margin-bottom: 20px;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background-color: transparent;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body :deep(pre) {
  background-color: #f8f8f8 !important;
  color: #333 !important;
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #eaeaea;
  margin: 10px 0;
}

.markdown-body :deep(code) {
  background-color: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  font-family: inherit !important;
  font-size: inherit !important;
  border: none !important;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  border: 1px solid #eaeaea;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #eaeaea;
  padding: 8px;
  text-align: left;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin: 0 0 16px 0;
}

.markdown-body :deep(hr) {
  border: none;
  height: 0;
  background-color: transparent;
  margin: 0;
  padding: 0;
}

.card-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 20px 0;
}

.card-item {
  background: #fafbfc;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  min-width: 120px;
  text-align: center;
  font-size: 16px;
  color: #333;
}

.card-index {
  color: #409EFF;
  font-weight: bold;
  margin-right: 4px;
}

.card-title {
  font-weight: 500;
}

.card-tip {
  background-color: #eef6ff;
  padding: 12px 20px;
  border-radius: 10px;
  text-align: left;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.contains-wrapper {
  text-align: center;
  margin-top: 20px;
}

.teal-button {
  background-color: #3F51B5;
  color: #fff;
  border-color: #3F51B5;
}

.teal-button:hover {
  background-color: #5C6BC0;
  /* 比原色稍浅一点，适合作为 hover */
  border-color: #5C6BC0;
}

.teal-button:disabled {
  background-color: #C5CAE9;
  /* 浅蓝灰 */
  border-color: #C5CAE9;
  color: #f2f2f2;
  cursor: not-allowed;
}

.button-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 12px;
  /* 只控制左右间距 */
  row-gap: 12px;
  margin-bottom: 20px;
}


.button-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 12px;
  /* 只控制左右间距 */
  row-gap: 12px;
  margin-bottom: 20px;
}

/* 所有按钮强制一致宽高 */
.button-wrapper :deep(.el-button) {
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* upload 内部结构调整为按钮尺寸 */
.button-wrapper :deep(.el-upload) {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0;
  margin: 0;
  /* 避免上传按钮比其他按钮多 margin */
}


.edit-button {
  background-color: #4CAF50;
  color: #fff;
  border-color: #4CAF50;
}

.edit-button:hover {
  background-color: #66BB6A;
  /* hover 时稍浅的绿色 */
  border-color: #66BB6A;
}

.edit-button:disabled {
  background-color: #C8E6C9;
  /* disabled 用浅绿灰色 */
  border-color: #C8E6C9;
  color: #f2f2f2;
  cursor: not-allowed;
}

.export-button {
  background-color: #9E9E9E;
  /* 中性灰 */
  color: #fff;
  border-color: #9E9E9E;
}

.export-button:hover {
  background-color: #BDBDBD;
  /* hover 浅灰 */
  border-color: #BDBDBD;
}

.export-button:disabled {
  background-color: #E0E0E0;
  /* disabled 更浅 */
  border-color: #E0E0E0;
  color: #f2f2f2;
  cursor: not-allowed;
}
</style>