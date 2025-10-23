<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="top-wrapper">
      <div class="top-nav">
        <div class="left">
          <img src="/logo.jpg" alt="Logo" class="logo" />
          <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="nav-menu">
            <el-menu-item index="dashboard">模拟面试</el-menu-item>
            <el-menu-item index="interviews">简历分析</el-menu-item>
            <el-menu-item index="questions">知识库</el-menu-item>
            <el-menu-item index="upload">上传知识库</el-menu-item>
            <el-menu-item index="settings">设置</el-menu-item>
          </el-menu>
        </div>
        <div class="right user-info">
          <div class="user-info-wrapper">
            <div class="user-text-group">
              <div class="user-header">
                <span class="welcome-text">欢迎回来</span>
                <el-button type="text" @click="logout">退出</el-button>
              </div>
              <UsageCounter />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <div class="page-wrapper">
        <DashboardUpload v-if="activeMenu === 'dashboard'" />
        <ResumeUpload v-else-if="activeMenu === 'interviews'" />
        <QuestionKnowledge v-else-if="activeMenu === 'questions'" />
        <KnowledgeUpload v-else-if="activeMenu === 'upload'" />
        <SettingsPanel v-else-if="activeMenu === 'settings'" />
      </div>
    </div>

    <!-- 底部横幅 -->
    <div class="footer-banner">
      <img src="/footer-banner.jpg" alt="让你的面试更轻松" class="footer-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import DashboardUpload from '@/components/DashboardUpload.vue'
import ResumeUpload from '@/components/ResumeUpload.vue'
import QuestionKnowledge from '@/components/QuestionKnowledge.vue'
import KnowledgeUpload from '@/components/KnowledgeUpload.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import UsageCounter from '@/components/UsageCounter.vue'

const router = useRouter()
const activeMenu = ref('dashboard')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
}

.top-wrapper {
  background-color: #d9ecff;
  border-bottom: 1px solid #e0e0e0;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.left {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.logo {
  height: 58px;
  margin-right: 36px;
}

.nav-menu {
  background-color: transparent;
  border-bottom: none;
  flex-wrap: nowrap;
  white-space: nowrap;
  min-width: 700px;
}

.right.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 280px;
  margin-right: 20px;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-text-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  font-size: 14px;
  color: #333;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-wrapper {
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  box-sizing: border-box;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  /* NEW */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer-banner {
  width: 100%;
  max-height: 120px;
  background-color: #d9ecff;
  text-align: center;
  margin-top: 0;
}

.footer-image {
  width: 100%;
  max-width: 100%;
  display: block;
  margin: 0 auto;
}
</style>
