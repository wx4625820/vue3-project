<template>
    <el-card class="login-card" shadow="hover">
        <h2 class="title">登录</h2>
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="loginForm.email" autocomplete="off" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="loginForm.password" autocomplete="off" placeholder="请输入密码"
                    show-password />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">登录</el-button>
                <el-button type="text" @click="goToRegister">还没有账号？去注册</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>


<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

interface LoginForm {
    email: string
    password: string
}

const loginForm = reactive<LoginForm>({
    email: '',
    password: ''
})

const rules: FormRules = {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginFormRef = ref<FormInstance>()
const router = useRouter()

const goToRegister = () => {
    router.push('/register')
}

const onSubmit = () => {
    loginFormRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            try {
                // 向后端发送登录请求
                const response = await axios.post('/user/login', {
                    email: loginForm.email,
                    password: loginForm.password
                })

                // 模拟登录成功：你可以在这里保存 token，或用户信息等
                // localStorage.setItem('token', response.data.token)

                // 跳转到主页
                if (response.data.code === 200) {
                    ElMessage.success(`欢迎，${loginForm.email}！`)
                    router.push('/home')
                } else {
                    ElMessage.error(response.data.message || '登录失败，请检查用户名或密码')
                }
            } catch (error) {
                ElMessage.error('登录失败，请检查用户名或密码')
            }
        } else {
            ElMessage.error('请填写完整信息')
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
