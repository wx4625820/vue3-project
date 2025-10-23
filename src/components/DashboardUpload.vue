<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">已分析视频</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">85%</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">3.2</div>
            <div class="stat-label">平均时长(分钟)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">8</div>
            <div class="stat-label">本月分析</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="content-grid">
        <!-- 左侧：上传区域 -->
        <div class="upload-section">
          <div class="upload-card">
            <div class="upload-header">
              <h2>智能面试分析</h2>
              <p>上传您的面试视频，AI将为您提供全面的表现评估</p>
            </div>
            
            <div class="upload-area" v-if="!videoUrl">
              <el-upload 
                :http-request="customUpload" 
                :show-file-list="false" 
                :before-upload="beforeUpload"
                class="upload-dropzone"
              >
                <div class="dropzone-content">
                  <div class="upload-icon">
                    <el-icon><Upload /></el-icon>
                  </div>
                  <div class="upload-text">
                    <h3>点击上传视频</h3>
                    <p>支持MP4格式，最大4GB</p>
                  </div>
                </div>
              </el-upload>
            </div>

            <!-- 上传进度 -->
            <el-progress 
              v-if="uploading" 
              :percentage="progress" 
              :text-inside="true" 
              :stroke-width="20" 
              type="line"
              status="active" 
              color="#6366F1" 
              :format="p => `${p.toFixed(1)}%`"
              class="upload-progress"
            />

            <!-- 视频预览区域 -->
            <div v-if="showVideo && videoUrl" class="video-preview-section">
              <div class="video-card">
                <div class="video-header">
                  <h3>视频预览</h3>
                  <div class="video-info">
                    <span>{{ uploadedFileName }}</span>
                    <el-button type="danger" text @click="deleteVideo" size="small">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
                <div class="video-player-container">
                  <video ref="videoPlayer" :src="videoUrl" controls class="video-player" />
                </div>
                <div class="video-actions">
                  <div class="role-selection">
                    <label>选择岗位类型</label>
                    <el-select v-model="selectedRole" placeholder="请选择岗位" class="role-select">
                      <el-option label="技术岗" value="技术岗" />
                      <el-option label="运维岗" value="运维岗" />
                      <el-option label="测试岗" value="测试岗" />
                      <el-option label="产品岗" value="产品岗" />
                      <el-option label="设计岗" value="设计岗" />
                      <el-option label="运营岗" value="运营岗" />
                    </el-select>
                  </div>
                  <el-button 
                    type="primary" 
                    @click="analyzeVideo" 
                    :disabled="!selectedRole" 
                    class="analyze-btn"
                    size="large"
                  >
                    <el-icon><VideoCamera /></el-icon>
                    开始智能分析
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：功能卡片 -->
        <div class="features-section">
          <!-- 快速操作 -->
          <div class="feature-card">
            <div class="card-header">
              <h3>快速操作</h3>
            </div>
            <div class="quick-actions">
              <div class="action-item" @click="showUploadGuide">
                <div class="action-icon">
                  <el-icon><QuestionFilled /></el-icon>
                </div>
                <div class="action-content">
                  <h4>使用指南</h4>
                  <p>了解如何使用系统</p>
                </div>
              </div>
              <div class="action-item" @click="showHistory">
                <div class="action-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="action-content">
                  <h4>历史记录</h4>
                  <p>查看过往分析</p>
                </div>
              </div>
              <div class="action-item" @click="showSettings">
                <div class="action-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <div class="action-content">
                  <h4>系统设置</h4>
                  <p>个性化配置</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 分析维度 -->
          <div class="feature-card">
            <div class="card-header">
              <h3>分析维度</h3>
            </div>
            <div class="dimensions-list">
              <div v-for="(dimension, index) in dimensions" :key="index" class="dimension-item">
                <div class="dimension-icon">
                  <el-icon><component :is="getDimensionIcon(dimension.title)" /></el-icon>
                </div>
                <div class="dimension-content">
                  <h5>{{ dimension.title }}</h5>
                  <p>{{ dimension.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析结果 -->
      <div v-if="showResultBox" class="result-section">
        <div class="result-card">
          <div class="result-header">
            <h3>分析结果</h3>
            <el-button v-if="showExportButton" type="success" @click="exportPdf" class="export-btn">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </div>
          <div class="result-content">
            <div class="result-text">
              <div class="output-box">
                <div class="stream-text" v-html="renderedMarkdown"></div>
              </div>
            </div>
            <div class="result-chart">
              <v-chart v-if="showChart" :option="radarOption" autoresize class="radar-chart" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载对话框 -->
    <el-dialog v-model="showInitDialog" title="上传中" width="320px" :close-on-click-modal="false" :show-close="false">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在初始化上传，请耐心等待…</p>
      </div>
    </el-dialog>

    <el-dialog v-model="showAnalyzingDialog" title="分析中" width="320px" :close-on-click-modal="false" :show-close="false">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在分析视频，请耐心等待...</p>
      </div>
    </el-dialog>

    <!-- 上传成功弹窗 -->
    <el-dialog v-model="showSuccessDialog" title="上传成功" width="360px" :close-on-click-modal="true">
      <div class="success-content">
        <div class="success-animation">
          <el-icon class="success-icon"><Check /></el-icon>
        </div>
        <h4>上传成功！</h4>
        <p>视频已可播放，请选择岗位进行分析</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showSuccessDialog = false" class="confirm-btn">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { 
  Loading, VideoCamera, Upload, Delete, Download, Check,
  Monitor, Document, Collection, Setting, QuestionFilled,
  ChatLineRound, User, TrendCharts, Star, Clock, VideoPlay,
  InfoFilled, Lightning
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import html2pdf from 'html2pdf.js'

// 响应式数据
const showExportButton = ref(false)
const uploading = ref(false)
const progress = ref(0)
const videoUrl = ref<string | null>(null)
const uploadedFileName = ref('')
const showInitDialog = ref(false)
const showAnalyzingDialog = ref(false)
const showVideo = ref(false)
const videoKey = ref(0)
const selectedRole = ref('')
const showChart = ref(false)
const showResultBox = ref(false)
const streamResult = ref('')
const radarData = ref([0, 0, 0, 0, 0, 0])
const renderedMarkdown = ref('')
const showSuccessDialog = ref(false)
const activeNav = ref('dashboard')
const userAvatar = ref('')
const isPlaying = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)

// 分析维度
const dimensions = [
  { title: '语言逻辑', description: '表达是否清晰、有条理' },
  { title: '面部表情', description: '表情自然积极，传递情绪' },
  { title: '眼神交流', description: '视线是否稳定、自然交流' },
  { title: '技能匹配', description: '回答是否符合岗位要求' },
  { title: '专业知识', description: '答题是否准确、有深度' },
  { title: '情感语调', description: '语气自然，有感染力' }
]

// Markdown 渲染
watchEffect(() => {
  try {
    const result = marked.parse(streamResult.value)
    if (typeof result === 'string') {
      renderedMarkdown.value = result
    } else {
      result.then(html => {
        renderedMarkdown.value = html
      })
    }
  } catch (error) {
    console.error('Markdown parsing error:', error)
    renderedMarkdown.value = streamResult.value
  }
})

// 雷达图配置
const radarIndicators = ['语言逻辑', '面部表情', '眼神交流', '技能匹配', '专业知识', '情感语调']
const radarOption = computed(() => ({
  title: { 
    text: '综合能力分析', 
    left: 'center', 
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1F2937'
    }
  },
  tooltip: {},
  radar: {
    indicator: radarIndicators.map(name => ({ name, max: 100 })),
    radius: '65%',
    splitNumber: 4,
    axisLine: {
      lineStyle: {
        color: '#E5E7EB'
      }
    },
    splitLine: {
      lineStyle: {
        color: '#E5E7EB'
      }
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ['#F9FAFB', '#FFFFFF']
      }
    }
  },
  series: [{
    name: '评分',
    type: 'radar',
    data: [{ 
      value: radarData.value, 
      name: '综合得分',
      itemStyle: {
        color: '#6366F1'
      },
      areaStyle: {
        color: 'rgba(99, 102, 241, 0.2)'
      },
      lineStyle: {
        color: '#6366F1',
        width: 2
      }
    }]
  }]
}))

// 导出PDF
const exportPdf = async () => {
  const chartDom = document.querySelector('.result-section canvas') as HTMLCanvasElement
  const outputBox = document.querySelector('.output-box') as HTMLElement

  if (!chartDom || !outputBox) return

  const chartImg = chartDom.toDataURL('image/png')
  const img = document.createElement('img')
  img.src = chartImg
  img.style.width = '100%'
  img.style.marginTop = '20px'

  outputBox.appendChild(img)
  await nextTick()

  html2pdf().set({
    margin: 0.5,
    filename: `模拟面试分析报告_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).from(outputBox).save().then(() => {
    img.remove()
  })
}

// 提取雷达图分数
function extractRadarScores(markdown: string): number[] {
  const scoreMap: Record<string, number> = {}
  const regex = /([语言逻辑面部表情眼神交流技能匹配专业知识]{3,})[：:（(\s]*?(\d{2})\s*(?:\/100)?/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(markdown)) !== null) {
    const label = match[1].trim()
    const score = parseInt(match[2])
    if (!isNaN(score)) scoreMap[label] = score
  }
  return radarIndicators.map(label => scoreMap[label] ?? 0)
}

// 获取维度图标
function getDimensionIcon(title: string) {
  const iconMap: Record<string, any> = {
    '语言逻辑': ChatLineRound,
    '面部表情': User,
    '眼神交流': TrendCharts,
    '技能匹配': Star,
    '专业知识': Document,
    '情感语调': Collection
  }
  return iconMap[title] || ChatLineRound
}

// 生命周期
onMounted(async () => {
  try {
    const res = await request.get('/file/get-file')
    if (res.data && res.data.code === 200 && res.data.data) {
      uploadedFileName.value = res.data.data
      const urlRes = await request.get('/file/file-download-url', {
        params: { originalFilename: uploadedFileName.value }
      })
      videoUrl.value = urlRes.data
      showVideo.value = true
    }
  } catch (e) {
    console.warn('无已有视频')
  }
})

// 文件上传前验证
const beforeUpload = (file: any) => {
  const realFile = file instanceof File ? file : file.raw as File
  const ext = realFile.name.split('.').pop()?.toLowerCase()
  const allowedExts = ['mp4']
  const isLt4GB = realFile.size / 1024 / 1024 < 4096
  if (!ext || !allowedExts.includes(ext)) {
    ElMessage.warning('仅支持上传 mp4 格式视频')
    return false
  }
  if (!isLt4GB) {
    ElMessage.warning('视频大小不能超过 4GB')
    return false
  }
  return true
}

// 自定义上传
const customUpload = async (options: any) => {
  const file = options.file as File
  uploading.value = true
  progress.value = 0
  uploadedFileName.value = file.name
  showInitDialog.value = true
  const formData = new FormData()
  formData.append('file', file)
  try {
    await request.post('/file/async-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    showInitDialog.value = false
    const timer = setInterval(async () => {
      try {
        const res = await request.get('/file/upload-progress', {
          params: { originalFilename: uploadedFileName.value }
        })
        const percent = res.data
        if (percent >= 0) progress.value = percent
        if (progress.value >= 100) {
          clearInterval(timer)
          uploading.value = false
          const urlRes = await request.get('/file/file-download-url', {
            params: { originalFilename: uploadedFileName.value }
          })
          videoUrl.value = urlRes.data
          showVideo.value = true
          videoKey.value++
          showSuccessDialog.value = true
        }
      } catch (e) {
        clearInterval(timer)
        uploading.value = false
        ElMessage.error('获取进度失败')
      }
    }, 1000)
  } catch (e) {
    showInitDialog.value = false
    uploading.value = false
    ElMessage.error('上传失败')
  }
}

// 删除视频
const deleteVideo = async () => {
  try {
    await request.delete('/file/delete', {
      params: { fileName: uploadedFileName.value }
    })
    videoUrl.value = null
    uploadedFileName.value = ''
    showVideo.value = false
    progress.value = 0
    uploading.value = false
    selectedRole.value = ''
    videoKey.value++
    showChart.value = false
    showResultBox.value = false
    streamResult.value = ''
    ElMessage.success('视频已删除')
  } catch (e) {
    ElMessage.error('删除失败了')
  }
}

// 播放视频
const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play()
    isPlaying.value = true
  }
}

// 顶部工具栏方法
const showUploadGuide = () => {
  ElMessage.info('使用指南功能开发中')
}

const showHistory = () => {
  ElMessage.info('历史记录功能开发中')
}

const showSettings = () => {
  ElMessage.info('设置功能开发中')
}

const showStatistics = () => {
  ElMessage.info('数据统计功能开发中')
}

// 分析视频
const analyzeVideo = async () => {
  if (!selectedRole.value || !videoUrl.value) return

  streamResult.value = ''
  showChart.value = false
  showResultBox.value = false
  showAnalyzingDialog.value = true

  try {
    const response = await fetch('/rag/analyze-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl.value })
    })

    if (!response.body) {
      ElMessage.error('后端未返回内容')
      showAnalyzingDialog.value = false
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
        streamResult.value += chunk

        if (!showResultBox.value) showResultBox.value = true
        if (showAnalyzingDialog.value) showAnalyzingDialog.value = false

        // 实时解析 markdown
        if (renderTimer) clearTimeout(renderTimer)
        renderTimer = window.setTimeout(() => {
          const raw = streamResult.value
          const match = raw.match(/```markdown\s*([\s\S]*?)```/)
          const pureMarkdown = match ? match[1].trim() : raw
          const result = marked.parse(pureMarkdown)
          if (typeof result === 'string') {
            renderedMarkdown.value = result
          } else {
            result.then(html => {
              renderedMarkdown.value = html
            })
          }
        }, 80)

        await nextTick()
      }
    }

    streamResult.value = streamResult.value.replace(/```markdown\s*([\s\S]*?)```/, (_, content) => content.trim())

    // ✅ 提取评分并更新雷达图
    radarData.value = extractRadarScores(streamResult.value)
    showChart.value = true
    showExportButton.value = true
  } catch (err) {
    console.error('analyzeVideo error:', err)
    ElMessage.error('分析失败，请稍后再试')
    showAnalyzingDialog.value = false
  }
}
</script>

<style scoped>
/* 导入 Inter 字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 24px;
  gap: 24px;
}

/* 统计卡片区域 */
.stats-section {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

/* 上传区域 */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.upload-header {
  text-align: center;
  margin-bottom: 32px;
}

.upload-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.upload-header p {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

.upload-area {
  margin-bottom: 24px;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.upload-dropzone:hover {
  border-color: #6366F1;
  background: #eef2ff;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #6366F1;
}

.upload-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
}

.upload-text p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.upload-progress {
  margin: 20px 0;
}

/* 视频预览区域 */
.video-preview-section {
  margin-top: 24px;
}

.video-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.video-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6B7280;
}

.video-player-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player {
  width: 100%;
  height: 300px;
  object-fit: contain;
}

.video-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-selection label {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}

.role-select {
  width: 100%;
}

.analyze-btn {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
}

/* 功能区域 */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  background: #eef2ff;
  transform: translateX(4px);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.action-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.action-content p {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
}

/* 分析维度 */
.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.dimension-item:hover {
  background: #eef2ff;
}

.dimension-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366F1;
  font-size: 16px;
}

.dimension-content h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 2px;
}

.dimension-content p {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
}

/* 结果区域 */
.result-section {
  width: 100%;
}

.result-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.export-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
}

.result-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.result-text {
  min-height: 400px;
}

.output-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #E5E7EB;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.stream-text {
  font-size: 14px;
  line-height: 1.7;
  color: #1F2937;
  word-break: break-word;
}

.result-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart {
  width: 100%;
  height: 400px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
}

/* 加载对话框 */
.loading-content {
  text-align: center;
  padding: 20px;
}

.loading-icon {
  font-size: 48px;
  color: #6366F1;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  color: #6B7280;
  margin: 0;
}

/* 成功弹窗 */
.success-content {
  text-align: center;
  padding: 20px;
}

.success-animation {
  margin-bottom: 20px;
}

.success-icon {
  font-size: 64px;
  color: #10B981;
  animation: successBounce 0.6s ease-in-out;
}

@keyframes successBounce {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-content h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.success-content p {
  color: #6B7280;
  margin: 0;
}

.confirm-btn {
  width: 100%;
  background: #6366F1;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .result-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .upload-card {
    padding: 24px;
  }
  
  .upload-dropzone {
    padding: 40px 20px;
  }
  
  .video-player {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-header h2 {
    font-size: 24px;
  }
  
  .upload-text h3 {
    font-size: 16px;
  }
}
</style>
