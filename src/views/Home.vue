<template>
  <div class="home-container">
    <el-header class="top-nav">
      <div class="left">
        <img src="/logo.png" alt="Logo" class="logo" />
        <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="nav-menu"
          style="min-width: 600px; flex-wrap: nowrap">
          <el-menu-item index="dashboard">模拟面试</el-menu-item>
          <el-menu-item index="interviews">简历分析</el-menu-item>
          <el-menu-item index="questions">知识库</el-menu-item>
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
    </el-header>

    <el-main class="main-content">
      <div v-if="activeMenu === 'dashboard'">
        <DashboardUpload />
      </div>

      <div v-else-if="activeMenu === 'interviews'">
        <ResumeUpload />
      </div>

      <div v-else-if="activeMenu === 'questions'">
        <QuestionKnowledge />
      </div>

      <div v-else-if="activeMenu === 'settings'">
        <el-card class="dashboard-card">
          <h2>修改密码</h2>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="change-password-form">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input type="password" v-model="form.oldPassword" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input type="password" v-model="form.newPassword" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input type="password" v-model="form.confirmPassword" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm">提交</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

import DashboardUpload from '@/components/DashboardUpload.vue'
import ResumeUpload from '@/components/ResumeUpload.vue'
import QuestionKnowledge from '@/components/QuestionKnowledge.vue'
import UsageCounter from '@/components/UsageCounter.vue'

const router = useRouter()
const activeMenu = ref('dashboard')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const logout = () => {
  router.push('/login')
}

// 修改密码表单逻辑
const formRef = ref()
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: any) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res = await axios.post('/user/change-password', null, {
          params: {
            oldPassword: form.oldPassword,
            newPassword: form.newPassword
          }
        })
        if (res.data.code === 200) {
          ElMessage.success('密码修改成功')
          form.oldPassword = ''
          form.newPassword = ''
          form.confirmPassword = ''
          // ✅ 跳转到“模拟面试”页面
          activeMenu.value = 'dashboard'
        } else {
          ElMessage.error(res.data.message)
        }
      } catch (err) {
        ElMessage.error('请求失败')
      }
    }
  })
}
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
  position: relative;
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  height: 58px;
  margin-right: 36px;
}

.nav-menu {
  background-color: transparent;
  border-bottom: none;
}

.right.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 320px;
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

.change-password-form {
  max-width: 500px;
  margin-top: 20px;
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
