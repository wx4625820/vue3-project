[media pointer="file-service://file-35YVGrRCo6hdYSKWp1UE3L"]
<template>
  <el-card class="dashboard-card">
    <!-- 标题 & 上传按钮 -->
    <div class="header" v-if="!videoUrl">
      <h2>模拟面试 - 视频上传</h2>
      <div class="upload-section">
        <el-upload :http-request="customUpload" :show-file-list="false" :before-upload="beforeUpload">
          <el-button type="primary" :disabled="uploading">选择并上传视频</el-button>
        </el-upload>
      </div>
    </div>

    <!-- 上传中进度条 -->
    <el-progress v-if="uploading" :percentage="progress" :text-inside="true" :stroke-width="20" type="line"
      status="active" color="#409EFF" :format="p => `${p.toFixed(1)}%`"
      style="margin: 30px auto 0; width: 100%; max-width: 600px" />

    <!-- 视频播放区 -->
    <!-- 视频播放区 -->
    <div v-if="showVideo && videoUrl" class="video-wrapper" :key="videoKey">
      <div class="video-left">
        <video :src="videoUrl" controls class="video-player" />
        <!-- 分析选项与按钮 -->
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
        <!-- 这里预留展示分析结果/图表 -->
        <div class="analysis-placeholder">分析结果区域</div>
      </div>
    </div>


    <!-- 上传初始化模态框 -->
    <el-dialog v-model="showInitDialog" title="提示" width="300px" :close-on-click-modal="false" :show-close="false">
      <div style="text-align: center">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <p style="margin-top: 10px">正在初始化上传，请耐心等待…</p>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { Loading } from '@element-plus/icons-vue'

const uploading = ref(false)
const progress = ref(0)
const videoUrl = ref<string | null>(null)
const uploadedFileName = ref('')
const showInitDialog = ref(false)
const showVideo = ref(false)
const videoKey = ref(0)
const selectedRole = ref('')

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
        const res = await request.get(`/file/upload-progress`, {
          params: { originalFilename: uploadedFileName.value }
        })

        const percent = res.data
        if (percent >= 0) {
          progress.value = percent
        }

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

    // 不判断 code，拦截器已处理
    videoUrl.value = null
    uploadedFileName.value = ''
    showVideo.value = false
    progress.value = 0
    uploading.value = false
    selectedRole.value = ''
    videoKey.value++
    ElMessage.success('视频已删除')
  } catch (e) {
    ElMessage.error('删除失败了')
  }
}

const analyzeVideo = async () => {
  if (!selectedRole.value) return
  ElMessage.success(`正在分析【${selectedRole.value}】，请稍候...`)
}
</script>

<style scoped>
.video-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
}

.video-left {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.video-right {
  flex: 0 0 40%;
  min-height: 300px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.analysis-placeholder {
  text-align: center;
}
</style>