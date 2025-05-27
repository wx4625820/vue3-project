<template>
  <div class="home-container">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <h3 class="sidebar-title">面试助手</h3>
        <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleMenuSelect">
          <el-menu-item index="dashboard">首页概览</el-menu-item>
          <el-menu-item index="interviews">我的面试</el-menu-item>
          <el-menu-item index="questions">题库</el-menu-item>
          <el-menu-item index="settings">设置</el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="user-info">
            <span class="username">欢迎回来，{{ username }}</span>
            <el-button type="text" @click="logout">退出</el-button>
          </div>
        </el-header>

        <el-main>
          <div v-if="activeMenu === 'dashboard'">
            <el-card class="dashboard-card">
              <h2>数据概览</h2>
              <p>模拟数据如下：</p>
              <ul>
                <li>已完成面试：12 场</li>
                <li>待安排面试：3 场</li>
                <li>总题量：156 道</li>
              </ul>
            </el-card>
          </div>

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

          <div v-else-if="activeMenu === 'questions'">
            <el-card class="dashboard-card">
              <h2>题库</h2>
              <el-tag v-for="(tag, index) in tags" :key="index" class="question-tag">{{ tag }}</el-tag>
            </el-card>
          </div>

          <div v-else-if="activeMenu === 'settings'">
            <el-card class="dashboard-card">
              <h2>设置</h2>
              <p>这里可以添加一些个性化设置选项</p>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = '测试用户'
const activeMenu = ref('dashboard')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const logout = () => {
  router.push('/login')
}

const interviewList = [
  { company: '字节跳动', position: '前端开发', date: '2025-06-01', status: '已完成' },
  { company: '腾讯', position: '全栈工程师', date: '2025-06-05', status: '待安排' },
  { company: '阿里巴巴', position: '后端开发', date: '2025-06-10', status: '进行中' }
]

const tags = ['Vue', 'JavaScript', '算法', '网络', '操作系统']
</script>

<style scoped>
.home-container {
  height: 100vh;
}
.sidebar {
  background-color: #f5f7fa;
  padding: 20px;
}
.sidebar-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}
.header {
  background-color: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
  height: 60px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dashboard-card {
  padding: 20px;
  margin: 20px 0;
}
.question-tag {
  margin: 5px;
}
</style>
