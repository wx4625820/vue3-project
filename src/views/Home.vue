<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <el-header class="top-nav">
      <div class="left">
        <span class="brand">面试助手</span>
        <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="nav-menu">
          <el-menu-item index="dashboard">模拟面试</el-menu-item>
          <el-menu-item index="interviews">我的面试</el-menu-item>
          <el-menu-item index="questions">题库</el-menu-item>
          <el-menu-item index="settings">设置</el-menu-item>
        </el-menu>
      </div>
      <div class="right user-info">
        <span>欢迎回来，{{ username }}</span>
        <el-button type="text" @click="logout">退出</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <!-- 模拟面试 -->
      <div v-if="activeMenu === 'dashboard'">
        <el-card class="dashboard-card">
          <h2>模拟面试 - 视频上传</h2>

          <el-upload :http-request="customUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button type="primary" :disabled="uploading">选择并上传视频</el-button>
          </el-upload>
          <el-progress :percentage="progress" :text-inside="true" :stroke-width="20" type="line" status="active"
            color="#409EFF" style="margin-top: 20px; width: 100%; max-width: 600px"
            :format="(p) => `${p.toFixed(2)}%`" />

          <p style="margin-top: 10px">当前进度：{{ progress.toFixed(2) }}%</p>


          <div v-if="videoUrl" class="video-wrapper">
            <video ref="videoRef" :src="videoUrl" controls class="video-player"></video>

            <div class="video-actions">
              <el-button type="danger" @click="deleteVideo">删除视频</el-button>
              <el-button type="primary" @click="analyzeVideo">一键分析</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 我的面试 -->
      <div v-else-if="activeMenu === 'interviews'">
        <el-card class="dashboard-card">
          <h2>我的面试</h2>
          <el-table :data="interviewList" style="width: 100%">
            <el-table-column prop="company" label="公司" />
            <el-table-column prop="position" label="职位" />
            <el-table-column prop="date" label="日期" />
            <el-table-column prop="status" label="状态" />
          </el-table>
        </el-card>
      </div>

      <!-- 题库 -->
      <div v-else-if="activeMenu === 'questions'">
        <el-card class="dashboard-card">
          <h2>题库</h2>
          <el-tag v-for="(tag, index) in tags" :key="index" class="question-tag">{{ tag }}</el-tag>
        </el-card>
      </div>

      <!-- 设置 -->
      <div v-else-if="activeMenu === 'settings'">
        <el-card class="dashboard-card">
          <h2>设置</h2>
          <p>这里可以添加一些个性化设置选项</p>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const username = '测试用户'
const activeMenu = ref('dashboard')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const logout = () => {
  router.push('/login')
}

// 状态变量
const uploading = ref(false)
const progress = ref(0)
const videoUrl = ref<string | null>(null)
const uploadedFileName = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)

// 页面加载时获取已上传视频
onMounted(async () => {
  try {
    const res = await request.get('/file/get-file')
    if (res.data.code === 200 && res.data.data) {
      const urlRes = await request.get('/file/file-download-url', {
        params: {
          originalFilename: uploadedFileName.value
        }
      })
      videoUrl.value = urlRes.data.data
      uploadedFileName.value = res.data.data
    }
  } catch (e) {
    console.warn('无已有视频')
  }
})

const beforeUpload = (file: any) => {
  const realFile = file instanceof File ? file : file.raw as File

  console.log('上传文件对象:', file)
  console.log('真实文件对象:', realFile)
  console.log('文件类型:', realFile?.type)

  if (!realFile || !realFile.type || !realFile.name) {
    ElMessage.warning('无法识别文件类型')
    return false
  }

  // ✅ 允许的 MIME 类型前缀或值
  const allowedMimeTypes = [
    'video/',                         // 常见前缀
    'application/vnd.rn-realmedia'   // rm/rmvb 专用类型
  ]

  const isMimeAllowed = allowedMimeTypes.some(type =>
    realFile.type.startsWith(type)
  )

  // ✅ 允许的文件扩展名
  const ext = realFile.name.split('.').pop()?.toLowerCase()
  const allowedExts = ['mp4', 'webm', 'ogg', 'rmvb']
  const isExtAllowed = !!ext && allowedExts.includes(ext)

  // ✅ 限制大小
  const isLt10GB = realFile.size / 1024 / 1024 < 10240

  if (!isMimeAllowed || !isExtAllowed) {
    ElMessage.warning('不支持的文件格式，仅支持 mp4/webm/ogg/rmvb')
    return false
  }

  if (!isLt10GB) {
    ElMessage.warning('视频大小不能超过 100MB')
    return false
  }

  return true
}

const customUpload = async (options: any) => {
  const file = options.file as File
  uploading.value = true
  progress.value = 0
  uploadedFileName.value = file.name

  const formData = new FormData()
  formData.append('file', file)

  try {
    console.log('▶️ 开始上传视频:', file.name)
    const uploadRes = await request.post('/file/async-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log('✅ 上传接口返回:', uploadRes.data)

    uploadedFileName.value = uploadRes.data
    ElMessage.success('上传中，请稍等...')

    // ⏱ 定时轮询上传进度
    const timer = setInterval(async () => {
      try {
        console.log('📡 请求进度，参数:', uploadedFileName.value)

        const filename = uploadedFileName.value
        const encoded = encodeURIComponent(filename)
        const res = await request.get(`/file/upload-progress?originalFilename=${encoded}`)


        console.log('📊 进度查询结果:', res.data)

        const percent = res.data
        if (percent >= 0) {
          progress.value = percent
        }

        if (progress.value >= 100) {
          clearInterval(timer)
          console.log('✅ 上传完成，获取视频地址...')

          const urlRes = await request.get('/file/file-download-url', {
            params: {
              originalFilename: encodeURIComponent(uploadedFileName.value) // ✅ 编码参数
            }
          })

          console.log('🎬 下载地址接口返回:', urlRes.data)

          videoUrl.value = urlRes.data.data
          ElMessage.success('上传成功！视频已可播放')
          uploading.value = false
        }
      } catch (e) {
        clearInterval(timer)
        uploading.value = false
        console.error('❌ 获取进度失败:', e)
        ElMessage.error('进度获取失败，请稍后重试')
      }
    }, 1000)
  } catch (error) {
    uploading.value = false
    console.error('❌ 上传出错:', error)
    ElMessage.error('上传失败，请检查网络或文件格式')
  }
}




// 删除视频
const deleteVideo = async () => {
  try {
    const res = await request.delete('/file/delete', {
      params: { fileName: uploadedFileName.value }
    })
    if (res.data.code === 200) {
      ElMessage.success('视频已删除')
      videoUrl.value = null
      uploadedFileName.value = ''
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    ElMessage.error('删除接口异常')
  }
}

// 一键分析按钮（示例调用）
const analyzeVideo = async () => {
  ElMessage.success('正在分析中，请稍候...')
  // await axios.post('/file/analyze', { fileName: uploadedFileName.value })
}

// 我的面试数据
const interviewList = [
  { company: '字节跳动', position: '前端开发', date: '2025-06-01', status: '已完成' },
  { company: '腾讯', position: '全栈工程师', date: '2025-06-05', status: '待安排' },
  { company: '阿里巴巴', position: '后端开发', date: '2025-06-10', status: '进行中' }
]

// 题库标签
const tags = ['Vue', 'JavaScript', '算法', '网络', '操作系统']
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Georgia', serif;
  background-color: #f7f9fc;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
  height: 60px;
}

.left {
  display: flex;
  align-items: center;
}

.brand {
  font-size: 20px;
  font-weight: bold;
  margin-right: 30px;
  color: #2c3e50;
}

.nav-menu {
  background-color: transparent;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.main-content {
  flex: 1;
  padding: 30px 60px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.dashboard-card h2 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.dashboard-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #333;
  line-height: 1.8;
}

.question-tag {
  margin: 6px;
}

.video-wrapper {
  margin-top: 20px;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.video-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
