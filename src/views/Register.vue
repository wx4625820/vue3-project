<template>
  <el-card class="login-card" shadow="hover">
    <h2 class="title">注册</h2>
    <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" show-password />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onRegister">注册</el-button>
        <el-button type="text" @click="goToLogin">已有账号？去登录</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

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
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
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
    }
  })
}

</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
