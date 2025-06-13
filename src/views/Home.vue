<template>
  <div class="home-container">
    <div class="top-wrapper">
      <div class="top-nav">
        <div class="left">
          <img src="/logo.png" alt="Logo" class="logo" />
          <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect" class="nav-menu">
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
      </div>
    </div>

    <div class="main-content">
      <div class="content-wrapper">
        <DashboardUpload v-if="activeMenu === 'dashboard'" />
        <ResumeUpload v-else-if="activeMenu === 'interviews'" />
        <QuestionKnowledge v-else-if="activeMenu === 'questions'" />
        <div v-else-if="activeMenu === 'settings'" class="settings-wrapper">
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
        </div>
      </div>
    </div>
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
  font-family: 'Georgia', serif;
}

.top-wrapper {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 0;
  padding-right: 0;
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
  padding: 40px 0 60px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.change-password-form {
  max-width: 500px;
  margin-top: 20px;
}
</style>
