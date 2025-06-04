<template>
  <div class="register-page">
    <div class="card">
      <h2>注册账号</h2>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        label-width="80px"
        class="form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onRegister">注册</el-button>
          <el-button type="text" @click="goToLogin">已有账号？登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #eef5ff, #d2e0f5);
  font-family: 'Georgia', serif;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  width: 400px;
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 30px;
}

.form {
  margin-top: 10px;
}
</style>
