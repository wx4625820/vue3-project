<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="(stat, index) in statsData" :key="index" :class="`stat-card-${index + 1}`">
          <div class="stat-icon">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" v-if="stat.trend">
              <el-icon><component :is="stat.trend > 0 ? 'TrendCharts' : 'TrendCharts'" /></el-icon>
              <span>{{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%</span>
            </div>
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
              <div class="header-icon">
                <el-icon><VideoCamera /></el-icon>
              </div>
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
                    <h3>点击或拖拽上传视频</h3>
                    <p>支持MP4格式，最大4GB</p>
                    <div class="upload-features">
                      <span class="feature-tag">AI分析</span>
                      <span class="feature-tag">实时反馈</span>
                      <span class="feature-tag">专业报告</span>
                    </div>
                  </div>
                </div>
              </el-upload>
            </div>

            <!-- 上传进度 -->
            <div v-if="uploading" class="upload-progress-container">
              <el-progress 
                :percentage="progress" 
                :text-inside="true" 
                :stroke-width="20" 
                type="line"
                status="active" 
                color="#6366F1" 
                :format="p => `${p.toFixed(1)}%`"
                class="upload-progress"
              />
              <p class="progress-text">正在上传视频，请稍候...</p>
            </div>

            <!-- 视频预览区域 -->
            <div v-if="showVideo && videoUrl" class="video-preview-section">
              <div class="video-card">
                <div class="video-header">
                  <div class="video-title">
                    <el-icon><VideoPlay /></el-icon>
                    <h3>视频预览</h3>
                  </div>
                  <div class="video-info">
                    <span class="file-name">{{ uploadedFileName }}</span>
                    <el-button type="danger" text @click="deleteVideo" size="small" class="delete-btn">
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
              <div class="header-icon">
                <el-icon><Lightning /></el-icon>
              </div>
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
                <el-icon class="action-arrow"><ArrowRight /></el-icon>
              </div>
              <div class="action-item" @click="showHistory">
                <div class="action-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="action-content">
                  <h4>历史记录</h4>
                  <p>查看过往分析</p>
                </div>
                <el-icon class="action-arrow"><ArrowRight /></el-icon>
              </div>
              <div class="action-item" @click="showSettings">
                <div class="action-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <div class="action-content">
                  <h4>系统设置</h4>
                  <p>个性化配置</p>
                </div>
                <el-icon class="action-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <!-- 分析维度 -->
          <div class="feature-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
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
                <div class="dimension-score">
                  <span class="score-label">权重</span>
                  <span class="score-value">{{ (index + 1) * 15 }}%</span>
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
            <div class="result-title">
              <el-icon><TrendCharts /></el-icon>
              <h3>分析结果</h3>
            </div>
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
  InfoFilled, Lightning, ArrowRight
} from '@element-plus/icons-vue'
import { marked } from 'marked'

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

// 统计数据
const statsData = [
  { icon: 'VideoCamera', value: '12', label: '已分析视频', trend: 15 },
  { icon: 'TrendCharts', value: '85%', label: '平均评分', trend: 8 },
  { icon: 'Clock', value: '3.2', label: '平均时长(分钟)', trend: -5 },
  { icon: 'Star', value: '8', label: '本月分析', trend: 25 },
  { icon: 'Document', value: '24', label: '简历分析', trend: 18 },
  { icon: 'Collection', value: '156', label: '知识库文档', trend: 32 }
]

// 分析维度
const dimensions = [
  { title: '语言逻辑', description: '表达是否清晰、有条理' },
  { title: '面部表情', description: '表情自然积极，传递情绪' },
  { title: '眼神交流', description: '视线是否稳定、自然交流' },
  { title: '技能匹配', description: '回答是否符合岗位要求' },
  { title: '专业知识', description: '答题是否准确、有深度' },
  { title: '情感语调', description: '语气自然，有感染力' }
]

// 获取维度图标
const getDimensionIcon = (title: string) => {
  const iconMap: Record<string, string> = {
    '语言逻辑': 'ChatLineRound',
    '面部表情': 'User',
    '眼神交流': 'Monitor',
    '技能匹配': 'Star',
    '专业知识': 'Document',
    '情感语调': 'TrendCharts'
  }
  return iconMap[title] || 'InfoFilled'
}

// 雷达图配置
const radarOption = computed(() => ({
  radar: {
    indicator: dimensions.map(dim => ({
      name: dim.title,
      max: 100
    }))
  },
  series: [{
    type: 'radar',
    data: [{
      value: radarData.value,
      name: '分析结果',
      areaStyle: {
        color: 'rgba(99, 102, 241, 0.3)'
      },
      lineStyle: {
        color: '#6366F1'
      },
      itemStyle: {
        color: '#6366F1'
      }
    }]
  }]
}))

// 自定义上传方法
const customUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    uploading.value = true
    progress.value = 0
    
    // 模拟上传进度
    const interval = setInterval(() => {
      progress.value += 10
      onProgress({ percent: progress.value })
      
      if (progress.value >= 100) {
        clearInterval(interval)
        uploading.value = false
        showVideo.value = true
        videoUrl.value = URL.createObjectURL(file)
        uploadedFileName.value = file.name
        showSuccessDialog.value = true
        onSuccess('上传成功')
      }
    }, 200)
    
  } catch (error) {
    uploading.value = false
    onError(error)
  }
}

// 上传前验证
const beforeUpload = (file: File) => {
  const isVideo = file.type.includes('video')
  const isLt4G = file.size / 1024 / 1024 / 1024 < 4
    
  if (!isVideo) {
    ElMessage.error('请上传视频文件!')
    return false
  }
  if (!isLt4G) {
    ElMessage.error('视频大小不能超过 4GB!')
    return false
  }
  return true
}

// 删除视频
const deleteVideo = () => {
  videoUrl.value = null
  uploadedFileName.value = ''
  showVideo.value = false
  selectedRole.value = ''
  showResultBox.value = false
  ElMessage.success('视频已删除')
}

// 分析视频
const analyzeVideo = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请选择岗位类型')
    return
  }
  
  showAnalyzingDialog.value = true
  
  try {
    // 模拟分析过程
    setTimeout(() => {
      showAnalyzingDialog.value = false
      showResultBox.value = true
      showChart.value = true
      showExportButton.value = true
      
      // 模拟分析结果
      streamResult.value = `# ${selectedRole.value}面试分析报告

## 总体评价
- **综合评分**: 85分
- **表现等级**: 良好
- **建议**: 继续提升专业技能

## 详细分析
1. **语言逻辑**: 表达清晰，逻辑性强
2. **面部表情**: 自然得体，亲和力强
3. **眼神交流**: 稳定自信，沟通良好
4. **技能匹配**: 符合岗位要求
5. **专业知识**: 基础扎实，需要深入
6. **情感语调**: 自然流畅，感染力强

## 改进建议
- 加强专业知识的深度
- 提升临场应变能力
- 优化表达节奏`
      
      // 确保marked返回Promise
      const markdownResult = marked(streamResult.value)
      if (typeof markdownResult === 'string') {
        renderedMarkdown.value = markdownResult
      } else {
        markdownResult.then(result => {
          renderedMarkdown.value = result
        })
      }
      
      // 模拟雷达数据
      radarData.value = [85, 90, 88, 82, 78, 87]
      
      ElMessage.success('分析完成')
    }, 3000)
    
  } catch (error) {
    showAnalyzingDialog.value = false
    ElMessage.error('分析失败，请重试')
  }
}

// 导出PDF
const exportPdf = () => {
  ElMessage.info('PDF导出功能暂不可用')
}

// 快速操作功能
const showUploadGuide = () => {
  ElMessage.info('使用指南功能开发中')
}

const showHistory = () => {
  ElMessage.info('历史记录功能开发中')
}

const showSettings = () => {
  ElMessage.info('系统设置功能开发中')
}
</script>

<style scoped>
/* 导入现代化字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.dashboard-container {
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

.dashboard-container::before {
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

/* 统计卡片区域 */
.stats-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover::after {
  opacity: 1;
}

.stat-card-1 .stat-icon {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.stat-card-2 .stat-icon {
  background: linear-gradient(135deg, #10B981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.stat-card-3 .stat-icon {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.stat-card-4 .stat-icon {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.stat-card-5 .stat-icon {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stat-card-6 .stat-icon {
  background: linear-gradient(135deg, #06B6D4, #0891B2);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #1F2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  width: fit-content;
}

.stat-trend.negative {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
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
  gap: 20px;
}

.upload-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.upload-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
  pointer-events: none;
}

.upload-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  transition: transform 0.3s ease;
}

.upload-card:hover .header-icon {
  transform: scale(1.05);
}

.upload-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1F2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-header p {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.upload-area {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 60px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.upload-dropzone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-dropzone:hover {
  border-color: #6366F1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.upload-dropzone:hover::before {
  opacity: 1;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.upload-icon {
  font-size: 48px;
  color: #6366F1;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.upload-text h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
}

.upload-text p {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 12px;
  font-weight: 500;
}

.upload-features {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-tag {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: transform 0.2s ease;
}

.feature-tag:hover {
  transform: translateY(-1px);
}

.upload-progress-container {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.upload-progress {
  margin-bottom: 12px;
}

.progress-text {
  text-align: center;
  color: #6B7280;
  font-weight: 500;
  margin: 0;
  font-size: 14px;
}

/* 视频预览区域 */
.video-preview-section {
  margin-top: 24px;
  position: relative;
  z-index: 1;
}

.video-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.video-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-title h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6B7280;
}

.file-name {
  font-weight: 500;
  color: #374151;
}

.delete-btn {
  color: #EF4444 !important;
  font-weight: 600;
}

.video-player-container {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.video-player {
  width: 100%;
  height: 320px;
  object-fit: contain;
}

.video-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-selection label {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.role-select {
  width: 100%;
}

.analyze-btn {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border: none;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.analyze-btn:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
}

/* 功能区域 */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.card-header .header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-item:hover {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  transform: translateX(8px) translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.action-item:hover::before {
  opacity: 1;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  position: relative;
  z-index: 1;
}

.action-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.action-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.action-content p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  font-weight: 500;
}

.action-arrow {
  color: #9CA3AF;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.action-item:hover .action-arrow {
  color: #6366F1;
  transform: translateX(4px);
}

/* 分析维度 */
.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dimension-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dimension-item:hover {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  transform: translateX(4px);
}

.dimension-item:hover::before {
  opacity: 1;
}

.dimension-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366F1;
  font-size: 18px;
  position: relative;
  z-index: 1;
}

.dimension-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.dimension-content h5 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.dimension-content p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  font-weight: 500;
}

.dimension-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.score-label {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.score-value {
  font-size: 14px;
  font-weight: 700;
  color: #6366F1;
}

/* 结果区域 */
.result-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.result-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
  pointer-events: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-title h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  background: linear-gradient(135deg, #1F2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.export-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.result-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.result-text {
  min-height: 360px;
}

.output-box {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 14px;
  padding: 24px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  min-height: 360px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.output-box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stream-text {
  font-size: 14px;
  line-height: 1.7;
  color: #1F2937;
  word-break: break-word;
}

.stream-text h1, .stream-text h2, .stream-text h3 {
  color: #1F2937;
  margin-bottom: 12px;
}

.stream-text ul, .stream-text ol {
  padding-left: 20px;
  margin-bottom: 16px;
}

.stream-text li {
  margin-bottom: 4px;
}

.result-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart {
  width: 100%;
  height: 360px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.radar-chart:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 加载对话框 */
.loading-content {
  text-align: center;
  padding: 32px;
}

.loading-icon {
  font-size: 64px;
  color: #6366F1;
  margin-bottom: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  color: #6B7280;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

/* 成功弹窗 */
.success-content {
  text-align: center;
  padding: 32px;
}

.success-animation {
  margin-bottom: 24px;
}

.success-icon {
  font-size: 80px;
  color: #10B981;
  animation: successBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes successBounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-content h4 {
  font-size: 24px;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 12px;
}

.success-content p {
  color: #6B7280;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.confirm-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
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
    padding: 60px 20px;
  }
  
  .video-player {
    height: 240px;
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
    font-size: 18px;
  }
}
</style>
