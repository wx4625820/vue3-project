<template>
  <div class="video-upload-container">
    <div class="upload-header">
      <h2>视频上传</h2>
      <p class="upload-description">上传您的视频文件，支持MP4格式</p>
    </div>

    <!-- 上传区域 -->
    <div class="upload-card">
      <div 
        class="upload-area"
        :class="{ 'upload-area--hover': isDragOver, 'upload-area--success': uploadStatus === 'success', 'upload-area--error': uploadStatus === 'error' }"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="upload-content">
          <div class="upload-icon">
            <el-icon v-if="uploadStatus === 'idle'"><Upload /></el-icon>
            <el-icon v-else-if="uploadStatus === 'success'" color="#52c41a"><CircleCheck /></el-icon>
            <el-icon v-else-if="uploadStatus === 'error'" color="#ff4d4f"><CircleClose /></el-icon>
          </div>
          <div class="upload-text">
            <template v-if="uploadStatus === 'idle'">
              <p class="upload-title">点击或拖拽视频到此处上传</p>
              <p class="upload-subtitle" v-if="isDragOver">松开即可上传</p>
            </template>
            <template v-else-if="uploadStatus === 'success'">
              <p class="upload-title">上传完成</p>
            </template>
            <template v-else-if="uploadStatus === 'error'">
              <p class="upload-title">上传失败，请重试</p>
            </template>
            <template v-else-if="uploadStatus === 'uploading'">
              <p class="upload-title">上传中...</p>
            </template>
          </div>
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input
          ref="fileInput"
          type="file"
          accept=".mp4,.MP4"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>

      <!-- 上传进度 -->
      <div v-if="uploadStatus === 'uploading'" class="upload-progress">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ uploadProgress }}%</div>
      </div>

      <!-- 功能按钮 -->
      <div class="upload-actions">
        <el-button 
          type="primary" 
          :loading="uploadStatus === 'uploading'" 
          @click="triggerFileInput"
          class="select-video-btn"
        >
          <el-icon><Document /></el-icon>
          选择视频
        </el-button>
        <el-button 
          v-if="uploadStatus === 'uploading'" 
          @click="cancelUpload"
          class="cancel-upload-btn"
        >
          取消上传
        </el-button>
      </div>

      <!-- 视频格式提示 -->
      <div class="format-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>支持MP4格式，单个文件不超过4G</span>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="file-list">
      <h3>已上传文件</h3>
      <div class="file-items">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
          <el-icon><VideoPlay /></el-icon>
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <el-button type="text" @click="removeFile(file.id)" class="remove-btn">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { 
  Upload, 
  Document, 
  InfoFilled, 
  CircleCheck, 
  CircleClose,
  VideoPlay,
  Delete
} from '@element-plus/icons-vue'

interface UploadedFile {
  id: string
  name: string
  size: number
  url?: string
}

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const uploadProgress = ref(0)
const uploadedFiles = ref<UploadedFile[]>([])
let uploadController: AbortController | null = null

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndUpload(file)
  }
  // 重置input值，允许重复选择同一文件
  target.value = ''
}

// 拖拽处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    validateAndUpload(file)
  }
}

// 文件验证和上传
const validateAndUpload = (file: File) => {
  // 验证文件类型
  if (!file.type.includes('video/mp4')) {
    ElMessage.error('仅支持MP4格式的视频文件')
    return
  }

  // 验证文件大小 (4GB = 4 * 1024 * 1024 * 1024 bytes)
  const maxSize = 4 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过4G')
    return
  }

  // 开始上传
  startUpload(file)
}

// 开始上传
const startUpload = async (file: File) => {
  uploadStatus.value = 'uploading'
  uploadProgress.value = 0
  
  // 创建取消控制器
  uploadController = new AbortController()
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // 使用真实的后端API上传
    await request.post('/file/async-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value = progress
        }
      }
    })

    // 上传成功
    uploadStatus.value = 'success'
    ElMessage.success('视频上传成功')
    
    // 添加到已上传文件列表
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size
    }
    uploadedFiles.value.unshift(newFile)

  } catch (error) {
    uploadStatus.value = 'error'
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadController = null
    // 3秒后重置状态
    setTimeout(() => {
      if (uploadStatus.value !== 'idle') {
        uploadStatus.value = 'idle'
        uploadProgress.value = 0
      }
    }, 3000)
  }
}

// 取消上传
const cancelUpload = () => {
  if (uploadController) {
    uploadController.abort()
    uploadController = null
  }
  uploadStatus.value = 'idle'
  uploadProgress.value = 0
  ElMessage.info('上传已取消')
}

// 删除文件
const removeFile = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId)
  ElMessage.success('文件已删除')
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.video-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--gap-lg, 32px) 5%;
}

.upload-header {
  text-align: center;
  margin-bottom: var(--gap-lg, 32px);
}

.upload-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.upload-description {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* 上传卡片 */
.upload-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin: var(--gap-md, 24px) 0;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  margin-bottom: var(--gap-md, 24px);
}

.upload-area:hover,
.upload-area--hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: scale(1.02);
}

.upload-area--success {
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-area--error {
  border-color: #ef4444;
  background: #fef2f2;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon .el-icon {
  font-size: 48px;
  color: #94a3b8;
}

.upload-area:hover .upload-icon .el-icon,
.upload-area--hover .upload-icon .el-icon {
  color: #3b82f6;
}

.upload-area--success .upload-icon .el-icon {
  color: #10b981;
}

.upload-area--error .upload-icon .el-icon {
  color: #ef4444;
}

.upload-title {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
}

.upload-subtitle {
  font-size: 0.9rem;
  color: #3b82f6;
  margin: 0;
}

.upload-area--success .upload-title,
.upload-area--error .upload-title {
  color: #1e293b;
  font-weight: 600;
}

/* 上传进度 */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: var(--gap-md, 24px) 0;
}

.progress-container {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #333;
  min-width: 40px;
  text-align: right;
}

/* 功能按钮 */
.upload-actions {
  display: flex;
  justify-content: center;
  gap: var(--gap-sm, 12px);
  margin-bottom: var(--gap-md, 24px);
}

.select-video-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.select-video-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.cancel-upload-btn {
  background: transparent;
  color: #6c757d;
  border: 1px solid #ced4da;
  padding: 10px 24px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.cancel-upload-btn:hover {
  color: #333;
  border-color: #adb5bd;
}

/* 格式提示 */
.format-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.format-tip .el-icon {
  font-size: 14px;
  color: #94a3b8;
}

/* 文件列表 */
.file-list {
  margin-top: var(--gap-lg, 32px);
}

.file-list h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: var(--gap-sm, 12px);
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.file-item .el-icon {
  font-size: 20px;
  color: #3b82f6;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.file-size {
  font-size: 12px;
  color: #64748b;
}

.remove-btn {
  color: #94a3b8 !important;
  padding: 4px;
}

.remove-btn:hover {
  color: #ef4444 !important;
  background: #fef2f2 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-upload-container {
    padding: var(--gap-md, 24px) 5%;
  }
  
  .upload-card {
    padding: 1.5rem;
    min-width: 280px;
  }
  
  .upload-area {
    padding: 2rem 1rem;
  }
  
  .upload-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .select-video-btn,
  .cancel-upload-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .upload-progress {
    flex-direction: column;
    gap: 8px;
  }
  
  .progress-text {
    text-align: center;
  }
}
</style>
