<template>
  <div class="resume-wrapper">
    <h2>简历上传</h2>

    <div class="upload-header">
      <el-upload :show-file-list="false" :before-upload="beforeUpload" :http-request="handleUpload">
        <el-button type="primary">上传 PDF 简历</el-button>
      </el-upload>

      <el-button circle class="icon-button" @click="dialogVisible = true">
        <el-icon>
          <FullScreen />
        </el-icon>
      </el-button>

      <el-button circle class="icon-button danger" @click="resumeStore.clear()">
        <el-icon>
          <Delete />
        </el-icon>
      </el-button>
    </div>

    <el-input type="textarea" v-model="resumeText" placeholder="请输入或粘贴简历内容..." :rows="10" class="resume-textarea" />

    <div style="text-align: right; margin-top: 10px">
      <el-button type="primary" :loading="analyzing" @click="analyze">一键分析</el-button>
    </div>

    <div v-if="resultMarkdown" class="markdown-card">
      <div class="markdown-body" v-html="renderedMarkdown" />
    </div>

    <div id="radar-chart" style="width: 100%; height: 400px; margin-top: 30px" v-if="showChart" />

    <el-dialog v-model="dialogVisible" title="编辑简历内容" width="700px">
      <el-input type="textarea" v-model="resumeText" :rows="20" style="width: 100%" />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { FullScreen, Delete } from '@element-plus/icons-vue'
import * as pdfjsLib from 'pdfjs-dist'
import * as echarts from 'echarts'
import { marked } from 'marked'
import { useResumeStore } from '@/stores/resumeStore'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const resumeStore = useResumeStore()
const resumeText = computed({
  get: () => resumeStore.text,
  set: val => resumeStore.setText(val),
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
  let queue: string[] = []
  let pushing = false

  const pushCharByChar = async (): Promise<void> => {
    if (pushing) return
    pushing = true
    let counter = 0
    while (queue.length > 0) {
      const nextChunk = queue.shift()
      if (nextChunk) {
        for (const char of nextChunk) {
          resultMarkdown.value += char
          counter++
          if (counter % 10 === 0) {
            renderedMarkdown.value = await marked(resultMarkdown.value) as string
          }
          await new Promise(resolve => setTimeout(resolve, 20))
        }
      }
    }
    renderedMarkdown.value = await marked(resultMarkdown.value) as string
    pushing = false
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    queue.push(chunk)
    await pushCharByChar()
  }

  await pushCharByChar()
  extractScores()
  showChart.value = true
  renderRadarChart()
  analyzing.value = false
}

const extractScores = () => {
  const markdown = resultMarkdown.value
  const dimensions = Object.keys(dimensionScores.value)
  dimensions.forEach((dim) => {
    const regex = new RegExp(`##\\s*${dim}[\\s\\S]*?-\\s*\\*\\*评分\\*\\*[:：]\\s*(\\d{1,3})`)
    const match = markdown.match(regex)
    if (match?.[1]) {
      dimensionScores.value[dim] = Number(match[1])
    }
  })
}

const renderRadarChart = async () => {
  await nextTick()
  const chartDom = document.getElementById('radar-chart')
  if (!chartDom) return
  const myChart = echarts.init(chartDom)
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
.resume-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
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
}

.markdown-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}
</style>
