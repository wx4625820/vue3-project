<template>
  <el-card class="reset-password-card" style="max-width: 400px; margin: 40px auto;">
    <h2 style="text-align: center;">重设密码</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="form.code" autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" autocomplete="off" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onResetPassword">重设密码</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: '',
  code: '',
  newPassword: ''
})

const loading = ref(false)
const formRef = ref(null)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const onResetPassword = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = await axios.post('/user/reset-password', {
        email: form.email,
        code: form.code,
        newPassword: form.newPassword
      })
      if (res.data.code === 200) {
        ElMessage.success(res.data.message || '密码重置成功')
        // 清空表单
        form.email = ''
        form.code = ''
        form.newPassword = ''
        // 跳转到登录页
        router.push('/login')
      } else {
        ElMessage.error(res.data.message || '密码重置失败')
      }
    } catch (error) {
      ElMessage.error('重设密码接口异常')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.reset-password-card {
  padding: 20px;
}
</style>
