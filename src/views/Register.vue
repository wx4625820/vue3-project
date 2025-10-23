<template>
  <div class="register-page">
    <div class="background-image"></div>
    <div class="overlay"></div>
    
    <div class="register-layout">
      <!-- 左侧简介区域 -->
      <div class="intro-section">
        <div class="intro-content">
          <h1 class="system-name">CapVista</h1>
          <p class="system-description">
            加入智能简历分析与职业发展平台，开启您的职业发展新篇章。
          </p>
          <div class="features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>专业简历分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>个性化职业指导</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>职业发展建议</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册区域 -->
      <div class="register-section">
        <div class="register-container">
          <div class="card">
            <div class="card-header">
              <h2>注册 CapVista</h2>
              <p class="subtitle">创建您的账号</p>
            </div>

            <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="form">
              <!-- 用户名 -->
              <el-form-item prop="username">
                <el-input 
                  v-model="registerForm.username" 
                  placeholder="请输入用户名"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 邮箱 -->
              <el-form-item prop="email">
                <el-input 
                  v-model="registerForm.email" 
                  placeholder="请输入邮箱地址"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 密码 -->
              <el-form-item prop="password">
                <el-input 
                  v-model="registerForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 注册按钮 -->
              <el-form-item>
                <el-button 
                  type="primary" 
                  class="register-button" 
                  @click="onRegister"
                  size="large"
                >
                  注册
                </el-button>
              </el-form-item>

              <!-- 登录链接 -->
              <div class="bottom-actions">
                <el-button type="text" @click="goToLogin" class="link-button">
                  已有账号？立即登录
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Check, Message } from '@element-plus/icons-vue'

interface RegisterForm {
  username: string
  email: string
  password: string
}

const registerForm = reactive<RegisterForm>({
  username: '',
  email: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerFormRef = ref<FormInstance>()
const router = useRouter()

const onRegister = async () => {
  registerFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/user/register', registerForm)
        const { code, message } = response.data

        if (code === 200) {
          ElMessage.success('注册成功，欢迎进入系统！')
          router.push('/home')
        } else {
          ElMessage.error(message || '注册失败，请检查信息')
        }
      } catch (err) {
        ElMessage.error('注册请求失败，请稍后再试')
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
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

.register-layout {
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

/* 右侧注册区域 */
.register-section {
  flex: 0 0 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.register-container {
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

.register-button {
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

.register-button:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.register-button:active:not(.is-disabled) {
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
  .register-layout {
    flex-direction: column;
  }
  
  .intro-section {
    flex: none;
    padding: 40px 20px;
    text-align: center;
  }
  
  .register-section {
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
  
  .register-section {
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
