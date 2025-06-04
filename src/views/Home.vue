<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <el-header class="top-nav">
      <div class="left">
        <span class="brand">AI面试小助手</span>
        <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="nav-menu"
          style="min-width: 600px; flex-wrap: nowrap">
          <el-menu-item index="dashboard">模拟面试</el-menu-item>
          <el-menu-item index="interviews">简历分析</el-menu-item>
          <el-menu-item index="questions">知识库</el-menu-item>
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
        <!-- 替换上传部分为组件 -->
        <DashboardUpload v-if="activeMenu === 'dashboard'" />
      </div>

      <!-- 我的面试 -->
      <div v-else-if="activeMenu === 'interviews'">
        <ResumeUpload />
      </div>

      <!-- 题库：替换为组件 -->
      <div v-else-if="activeMenu === 'questions'">
        <QuestionKnowledge />
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
import DashboardUpload from '@/components/DashboardUpload.vue'
import ResumeUpload from '@/components/ResumeUpload.vue'
import QuestionKnowledge from '@/components/QuestionKnowledge.vue'


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
