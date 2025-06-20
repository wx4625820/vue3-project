<template>
  <div class="login-page">
    <div class="card">
      <h2>登录系统</h2>

      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px" class="form">
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>

        <!-- 用户协议勾选 -->
        <el-form-item prop="agree">
          <el-checkbox v-model="loginForm.agree">
            同意 <a href="#" target="_blank">用户协议</a>、<a href="#" target="_blank">隐私政策</a>
          </el-checkbox>
        </el-form-item>

        <!-- 登录按钮独占一行 -->
        <el-form-item>
          <el-button type="primary" class="uniform-button" @click="onSubmit" :disabled="!loginForm.agree">
            登录
          </el-button>
        </el-form-item>

        <!-- 注册 / 忘记密码左右居中显示 -->
        <el-form-item class="bottom-actions">
          <el-button type="text" @click="goToRegister">立即注册</el-button>
          <el-button type="text" @click="goToForgot">忘记密码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  email: '',
  password: '',
  agree: false
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = () => {
  loginFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.error('请填写完整信息')
      return
    }

    try {
      const res = await request.post('/user/login', {
        email: loginForm.email,
        password: loginForm.password
      })

      ElMessage.success('登录成功')
      router.push('/home')
    } catch (e) {
      // 错误信息已经在拦截器中处理
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}

const goToForgot = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e6f0ff, #cfe0f5);
  font-family: 'Georgia', serif;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  width: 400px;
  margin-top: -100px;
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.form {
  margin-top: 10px;
  text-align: center;
  /* 居中表单内容 */
}

.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 10px;
}

.uniform-button {
  width: 180px;
  height: 40px;
  padding: 0 20px;
  box-sizing: border-box;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
