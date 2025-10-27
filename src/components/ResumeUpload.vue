<template>
  <div class="resume-upload-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="header-text">
          <h1>智能简历分析</h1>
          <p>上传您的简历，AI将为您提供全面的职业能力评估</p>
        </div>
      </div>
    </div>

    <!-- 主操作区域 -->
    <div class="main-content">
      <!-- 左侧操作面板 -->
      <div class="action-panel">
        <!-- 操作按钮组 -->
        <div class="button-section">
          <div class="button-grid">
            <!-- 第一行：上传和分析按钮 -->
            <div class="button-row">
              <el-upload :show-file-list="false" :before-upload="beforeUpload" :http-request="handleUpload">
                <el-button class="upload-btn" size="large">
                  <el-icon><Upload /></el-icon>
                  上传 PDF 简历
                </el-button>
              </el-upload>

              <el-button 
                type="primary" 
                :loading="analyzing" 
                @click="analyze" 
                class="analyze-btn" 
                size="large"
              >
                <el-icon><TrendCharts /></el-icon>
                一键分析
              </el-button>
            </div>

            <!-- 第二行：编辑和删除按钮 -->
            <div class="button-row">
              <el-button 
                @click="dialogVisible = true" 
                class="edit-btn" 
                size="large"
              >
                <el-icon><Edit /></el-icon>
                放大编辑
              </el-button>

              <el-button 
                type="danger" 
                @click="resumeStore.clear()" 
                class="delete-btn" 
                size="large"
              >
                <el-icon><Delete /></el-icon>
                删除简历
              </el-button>
            </div>

            <!-- 第三行：导出按钮（条件渲染） -->
            <div class="button-row" v-if="showExportButton">
              <el-button 
                @click="exportPdf" 
                class="export-btn" 
                size="large"
              >
                <el-icon><Download /></el-icon>
                导出报告
              </el-button>
            </div>
          </div>
        </div>

        <!-- 报告包含内容 -->
        <div class="features-section">
          <div class="features-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><Collection /></el-icon>
              </div>
              <h3>报告包含</h3>
            </div>
            <div class="features-list">
              <div class="feature-item" v-for="item in cardList" :key="item.index">
                <div class="feature-icon">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="feature-content">
                  <span class="feature-index">{{ item.index }}</span>
                  <span class="feature-title">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分析提示信息 -->
        <div class="info-card">
          <div class="info-header">
            <el-icon><InfoFilled /></el-icon>
            <h4>分析说明</h4>
          </div>
          <div class="info-content">
            <p>基于讯飞星火X1大语言模型，分析报告生成约需1分钟，预计消耗2000token，中途请不要退出。</p>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-panel">
        <!-- 简历输入区域 -->
        <div class="input-section">
          <div class="input-header">
            <el-icon><EditPen /></el-icon>
            <h3>简历内容</h3>
          </div>
          <el-input 
            type="textarea" 
            v-model="resumeText" 
            placeholder="请输入或粘贴简历内容..." 
            :rows="12" 
            class="resume-textarea" 
          />
        </div>

        <!-- 分析结果 -->
        <div v-if="resultMarkdown" class="result-section">
          <div class="result-card">
            <div class="result-header">
              <div class="result-title">
                <el-icon><TrendCharts /></el-icon>
                <h3>分析结果</h3>
              </div>
            </div>
            <div class="result-content">
              <div class="markdown-body" v-html="renderedMarkdown" />
            </div>
          </div>
        </div>

        <!-- 雷达图 -->
        <div v-if="showChart" class="chart-section">
          <div class="chart-card">
            <div class="chart-header">
              <el-icon><DataAnalysis /></el-icon>
              <h3>简历综合评分</h3>
            </div>
            <div id="radar-chart" class="radar-chart-container"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 放大编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑简历内容" width="800px" class="edit-dialog">
      <div class="dialog-content">
        <el-input type="textarea" v-model="resumeText" :rows="18" class="dialog-textarea" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false" class="dialog-btn">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, Upload, TrendCharts, Edit, Delete, Download,
  Collection, Check, InfoFilled, EditPen, DataAnalysis
} from '@element-plus/icons-vue'
import * as pdfjsLib from 'pdfjs-dist'
import * as echarts from 'echarts'
import { marked } from 'marked'
import { useResumeStore } from '@/stores/resumeStore'

const cardList = [
  { index: '一、', title: '基础信息' },
  { index: '二、', title: '教育背景' },
  { index: '三、', title: '工作经历' },
  { index: '四、', title: '专业技能' },
  { index: '五、', title: '行业对比' }
]
const showExportButton = ref(false)

const exportPdf = async () => {
  ElMessage.info('PDF导出功能暂不可用')
}




// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
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
          const markdownResult = marked.parse(pureMarkdown)
          if (typeof markdownResult === 'string') {
            renderedMarkdown.value = markdownResult
          } else {
            markdownResult.then(result => {
              renderedMarkdown.value = result
            })
          }
        }, 80)

        await nextTick()
      }
    }

    resultMarkdown.value = resultMarkdown.value.replace(/```markdown\s*([\s\S]*?)```/, (_, content) => content.trim())
    const markdownResult = marked.parse(resultMarkdown.value)
    if (typeof markdownResult === 'string') {
      renderedMarkdown.value = markdownResult
    } else {
      markdownResult.then(result => {
        renderedMarkdown.value = result
      })
    }
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
/* 导入现代化字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.resume-upload-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 24px;
  gap: 24px;
  position: relative;
  overflow-x: hidden;
}

.resume-upload-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* 头部区域 */
.header-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.header-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  gap: 24px;
  text-align: left;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.header-text h1 {
  font-size: 36px;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1F2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  font-size: 18px;
  color: #6B7280;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  position: relative;
  z-index: 1;
  align-items: start;
}

/* 左侧操作面板 */
.action-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 按钮区域 */
.button-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.button-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮行样式 */
.button-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.button-row :deep(.el-button) {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  min-height: 56px;
}

/* 确保上传组件内部的按钮样式一致 */
.button-row :deep(.el-upload) {
  display: flex;
  flex: 1;
}

.button-row :deep(.el-upload .el-button) {
  width: 100%;
  margin: 0;
}

.button-grid :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.button-grid :deep(.el-button.is-disabled) {
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 上传按钮 */
.upload-btn {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
}

.upload-btn:hover {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4) !important;
}

/* 分析按钮 */
.analyze-btn {
  background: linear-gradient(135deg, #6366F1, #8B5CF6) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
}

.analyze-btn:hover:not(.is-disabled) {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
}

/* 编辑按钮 */
.edit-btn {
  background: linear-gradient(135deg, #10B981, #059669) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

.edit-btn:hover {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
}

/* 删除按钮 */
.delete-btn {
  background: linear-gradient(135deg, #EF4444, #DC2626) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
}

.delete-btn:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
}

/* 导出按钮 */
.export-btn {
  background: linear-gradient(135deg, #6B7280, #4B5563) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
}

.export-btn:hover {
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4) !important;
}

/* 确保上传组件内部的按钮样式一致 */
.button-grid :deep(.el-upload) {
  display: block;
  width: 100%;
}

.button-grid :deep(.el-upload .el-button) {
  width: 100%;
  margin: 0;
}

/* 功能卡片 */
.features-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header .header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  transform: translateX(4px);
}

.feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10B981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.feature-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-index {
  font-size: 14px;
  font-weight: 600;
  color: #6366F1;
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
}

/* 信息卡片 */
.info-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.info-content p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
}

/* 右侧内容面板 */
.content-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 输入区域 */
.input-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.input-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.resume-textarea {
  width: 100%;
}

.resume-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
}

.resume-textarea :deep(.el-textarea__inner):focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

/* 结果区域 */
.result-section {
  width: 100%;
}

.result-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-title h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.result-content {
  min-height: 200px;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: #1F2937;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body :deep(pre) {
  background-color: #f8f8f8 !important;
  color: #333 !important;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #eaeaea;
  margin: 12px 0;
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
  margin: 12px 0;
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

/* 图表区域 */
.chart-section {
  width: 100%;
}

.chart-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.radar-chart-container {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

/* 对话框样式 */
.edit-dialog :deep(.el-dialog) {
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.edit-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0;
}

.edit-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.dialog-content {
  padding: 0;
}

.dialog-textarea {
  width: 100%;
}

.dialog-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.dialog-btn {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border: none;
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
}

.dialog-btn:hover {
  background: linear-gradient(135deg, #5C6BC0, #7C3AED);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .header-content {
    padding: 32px;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  
  .header-text h1 {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .resume-upload-container {
    padding: 16px;
  }
  
  .header-content {
    padding: 24px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .header-text h1 {
    font-size: 24px;
  }
  
  .header-text p {
    font-size: 16px;
  }
  
  .button-grid {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 20px;
  }
  
  .header-text h1 {
    font-size: 22px;
  }
  
  .button-section,
  .features-section,
  .info-card,
  .input-section,
  .result-card,
  .chart-card {
    padding: 20px;
  }
}
</style>
