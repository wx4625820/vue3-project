<template>
  <div class="login-page">
    <div class="card">
      <h2>登录系统</h2>

      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        label-width="80px"
        class="form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button type="text" @click="goToRegister">还没有账号？去注册</el-button>
          <div class="forgot-password">
            <el-button type="text" @click="goToForgot">忘记密码？</el-button>
          </div>
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
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
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
        password: loginForm.password,
      })

      ElMessage.success('登录成功')
      router.push('/home')
    } catch (e) {
      // 错误信息已经在拦截器中弹出，无需重复处理
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
  width: 380px;
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.forgot-password {
  margin-left: auto;
  padding-top: 4px;
}

.form {
  margin-top: 10px;
}
</style>
