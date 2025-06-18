<template>
  <div class="dashboard-upload-wrapper">
    <h2>模拟面试</h2>

    <div class="header" v-if="!videoUrl">
      <div class="header-row">
        <div class="upload-section">
          <el-upload :http-request="customUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button type="primary" :disabled="uploading">选择并上传视频</el-button>
          </el-upload>
        </div>
      </div>
    </div>

    <!-- 提示：报告包含的内容，上传中或视频已存在则隐藏 -->
    <div v-if="!videoUrl && !uploading" class="contains-wrapper">
      <span class="contains">报告包含：</span> 语言逻辑、面部表情、眼神交流、技能匹配、专业知识、情感语调
    </div>

    <!-- 分析卡片区域：上传前显示，上传中或视频已存在则隐藏 -->
    <div v-if="!videoUrl && !uploading" class="analysis-card-section">
      <div class="card" v-for="(item, index) in cardList" :key="index">
        <span class="card-index">{{ item.index }}</span>
        <span class="card-title">{{ item.title }}</span>
      </div>
      <div class="card-description">
        基于讯飞星火X1大语言模型，分析报告生成约需3分钟，预计消耗3000token，中途请不要退出。
        大模型输出完毕后，才可导出报告为 PDF 或 Markdown 文件！
      </div>
    </div>

    <el-progress v-if="uploading" :percentage="progress" :text-inside="true" :stroke-width="20" type="line"
      status="active" color="#409EFF" :format="p => `${p.toFixed(1)}%`"
      style="margin: 30px auto 0; width: 100%; max-width: 600px" />

    <div v-if="showVideo && videoUrl" class="video-wrapper" :key="videoKey">
      <div class="video-left">
        <video :src="videoUrl" controls class="video-player" />
        <div class="video-actions">
          <el-select v-model="selectedRole" placeholder="请选择岗位" style="width: 160px">
            <el-option label="技术岗" value="技术岗" />
            <el-option label="运维岗" value="运维岗" />
            <el-option label="测试岗" value="测试岗" />
            <el-option label="产品岗" value="产品岗" />
          </el-select>
          <el-button type="primary" @click="analyzeVideo" :disabled="!selectedRole">一键分析</el-button>
          <el-button type="danger" @click="deleteVideo">删除视频</el-button>
        </div>
      </div>

      <div class="video-right">
        <div class="dimension-explanation">
          <div><span class="dim">语言逻辑：</span>表达是否清晰、有条理。</div>
          <div><span class="dim">面部表情：</span>表情自然积极，传递情绪。</div>
          <div><span class="dim">眼神交流：</span>视线是否稳定、自然交流。</div>
          <div><span class="dim">技能匹配：</span>回答是否符合岗位要求。</div>
          <div><span class="dim">专业知识：</span>答题是否准确、有深度。</div>
          <div><span class="dim">情感语调：</span>语气自然，有感染力。</div>
        </div>
      </div>
    </div>

    <div v-if="showResultBox" class="analysis-result">
      <div class="output-box">
        <div class="stream-text">{{ streamResult }}</div>
      </div>
      <v-chart v-if="showChart" :option="radarOption" autoresize style="width: 100%; height: 400px; margin-top: 20px" />
    </div>

    <el-dialog v-model="showInitDialog" title="提示" width="300px" :close-on-click-modal="false" :show-close="false">
      <div style="text-align: center">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <p style="margin-top: 10px">正在初始化上传，请耐心等待…</p>
      </div>
    </el-dialog>

    <el-dialog v-model="showAnalyzingDialog" title="分析中..." width="300px" :close-on-click-modal="false"
      :show-close="false">
      <div style="text-align: center">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <p style="margin-top: 10px">正在分析视频，请耐心等待...</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { Loading } from '@element-plus/icons-vue'

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

const cardList = [
  { index: '一、', title: '语言逻辑' },
  { index: '二、', title: '面试题预测' },
  { index: '三、', title: '面部表情' },
  { index: '四、', title: '眼神交流' },
  { index: '五、', title: '技能匹配' },
  { index: '六、', title: '专业知识' }
]

const radarIndicators = ['语言逻辑', '情感语调', '专业知识', '技能匹配', '眼神交流', '面部表情']
const radarOption = computed(() => ({
  title: { text: '综合能力分析', left: 'center', top: 10 },
  tooltip: {},
  radar: {
    indicator: radarIndicators.map(name => ({ name, max: 100 })),
    radius: '60%'
  },
  series: [{
    name: '评分',
    type: 'radar',
    data: [{ value: radarData.value, name: '综合得分' }],
    areaStyle: {}
  }]
}))

function extractRadarScores(markdown: string): number[] {
  const scoreMap: Record<string, number> = {}
  const regex = /([语言逻辑情感语调专业知识技能匹配眼神交流面部表情]{3,})[：:（(\s]*?(\d{2})\s*(?:\/100)?/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(markdown)) !== null) {
    const label = match[1].trim()
    const score = parseInt(match[2])
    if (!isNaN(score)) scoreMap[label] = score
  }
  return radarIndicators.map(label => scoreMap[label] ?? 0)
}

onMounted(async () => {
  try {
    const res = await request.get('/file/get-file')
    if (res.code === 200 && res.data) {
      uploadedFileName.value = res.data
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
          ElMessage.success('上传成功！视频已可播放')
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
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        streamResult.value += chunk
        if (!showResultBox.value) showResultBox.value = true
        if (showAnalyzingDialog.value) showAnalyzingDialog.value = false
        await nextTick()
      }
    }
    radarData.value = extractRadarScores(streamResult.value)
    showChart.value = true
  } catch (err) {
    console.error('analyzeVideo error:', err)
    ElMessage.error('分析失败，请稍后再试')
    showAnalyzingDialog.value = false
  }
}
</script>

<style scoped>
.dashboard-upload-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.contains-wrapper {
  text-align: center;
  margin-top: 20px;
}

.contains {
  font-weight: 600;
  margin-right: 6px;
  color: #2c3e50;
}

.analysis-card-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin: 30px 0 20px;
  padding: 10px;
  background: #fff;
}

.card {
  display: flex;
  align-items: center;
  background: #f8f9fb;
  padding: 14px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  font-size: 18px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
}

.card-index {
  color: #409EFF;
  font-weight: bold;
  margin-right: 8px;
}

.card-description {
  margin-top: 20px;
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  color: #333;
  text-align: center;
  max-width: 100%;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.upload-section {
  display: flex;
  align-items: center;
}

.video-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  margin-top: 30px;
}

.video-left,
.video-right {
  flex: 1 1 500px;
  max-width: 100%;
  box-sizing: border-box;
}

.video-right {
  align-self: flex-start;
  margin-top: -10px;
}

.video-player {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.video-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.dimension-explanation {
  font-size: 16px;
  line-height: 1.8;
  text-align: left;
  word-break: break-word;
  margin-left: 44px;
  margin-top: 68px;
}

.dim {
  font-weight: 600;
  margin-right: 6px;
  color: #2c3e50;
}

.analysis-result {
  max-width: 100%;
  margin-top: 30px;
  overflow-x: auto;
  box-sizing: border-box;
}

.output-box {
  width: 100%;
  background: #f7f9fa;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  margin-top: 16px;
  box-sizing: border-box;
  overflow-x: auto;
}

.stream-text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>