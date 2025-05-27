<template>
  <el-card class="forgot-password-card">
    <h2 class="title">忘记密码 - 发送验证码</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" autocomplete="off" placeholder="请输入注册邮箱" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSendCode">发送验证码</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

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

      console.log('res.data:', res.data)

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
.forgot-password-card {
  max-width: 400px;
  margin: 80px auto;
  padding: 20px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
