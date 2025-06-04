<template>
  <div class="forgot-password-page">
    <div class="card">
      <h2>忘记密码</h2>
      <p class="subtitle">请输入注册邮箱，我们将发送验证码给你</p>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="form">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" autocomplete="off" placeholder="请输入注册邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSendCode">发送验证码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  email: ''
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ]
}

const onSendCode = () => {
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
      console.error('请求异常:', error)
      ElMessage.error('发送验证码接口异常')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.forgot-password-page {
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
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.form {
  margin-top: 10px;
}
</style>
