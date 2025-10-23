<template>
  <div class="forgot-password-page">
    <div class="background-image"></div>
    <div class="overlay"></div>
    
    <div class="forgot-layout">
      <!-- 左侧简介区域 -->
      <div class="intro-section">
        <div class="intro-content">
          <h1 class="system-name">CapVista</h1>
          <p class="system-description">
            智能简历分析与职业发展平台，为您提供专业的职业发展支持。
          </p>
          <div class="features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>安全密码重置</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>快速验证流程</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>即时邮件通知</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧忘记密码区域 -->
      <div class="forgot-section">
        <div class="forgot-container">
          <div class="card">
            <div class="card-header">
              <h2>重置密码</h2>
              <p class="subtitle">请输入注册邮箱，我们将发送验证码给您</p>
            </div>

            <el-form :model="form" :rules="rules" ref="formRef" class="form">
              <el-form-item prop="email">
                <el-input 
                  v-model="form.email" 
                  autocomplete="off" 
                  placeholder="请输入注册邮箱"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="loading" 
                  @click="onSendCode" 
                  class="forgot-button"
                  size="large"
                >
                  发送验证码
                </el-button>
              </el-form-item>

              <!-- 返回登录链接 -->
              <div class="bottom-actions">
                <el-button type="text" @click="goToLogin" class="link-button">
                  返回登录
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Check, Message } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  email: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ]
}

const onSendCode = async () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await axios.post('/user/forgot-password', {
        email: form.email
      })

      if (res.data.code === 200) {
        ElMessage.success(res.data.message || '验证码已发送，请检查邮箱')
        router.push('/reset-password')
      } else {
        ElMessage.error(res.data.message || '发送验证码失败')
      }
    } catch (error) {
      ElMessage.error('发送验证码接口异常')
    } finally {
      loading.value = false
    }
  })
}

// ✅ 新增跳转函数
const goToLogin = () => {
  router.push('/login')
}
</script>


<style scoped>
.forgot-password-page {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  z-index: 1;
}

.forgot-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  z-index: 2;
}

/* 左侧简介区域 */
.intro-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: white;
}

.intro-content {
  max-width: 500px;
}

.system-name {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.system-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.feature-item .el-icon {
  color: #10b981;
  font-size: 20px;
}

/* 右侧忘记密码区域 */
.forgot-section {
  flex: 0 0 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.forgot-container {
  width: 100%;
  max-width: 400px;
}

.card {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  width: 100%;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.custom-input .el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

:deep(.custom-input .el-input__wrapper:hover) {
  border-color: #cbd5e0;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.custom-input .el-input__inner) {
  font-size: 14px;
  color: #2d3748;
}

:deep(.custom-input .el-input__prefix) {
  color: #a0aec0;
  margin-right: 8px;
}

.forgot-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.forgot-button:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.forgot-button:active:not(.is-disabled) {
  transform: translateY(0);
}

.bottom-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.link-button {
  color: #667eea !important;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.link-button:hover {
  color: #5a67d8 !important;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .forgot-layout {
    flex-direction: column;
  }
  
  .intro-section {
    flex: none;
    padding: 40px 20px;
    text-align: center;
  }
  
  .forgot-section {
    flex: none;
    width: 100%;
    padding: 40px 20px;
  }
  
  .system-name {
    font-size: 36px;
  }
  
  .system-description {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .intro-section {
    padding: 30px 20px;
  }
  
  .forgot-section {
    padding: 30px 20px;
  }
  
  .system-name {
    font-size: 28px;
  }
  
  .system-description {
    font-size: 14px;
  }
  
  .card-header h2 {
    font-size: 24px;
  }
}
</style>
