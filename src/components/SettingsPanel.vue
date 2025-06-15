<template>
    <h2>修改密码</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="change-password-form">
        <el-form-item label="原密码" prop="oldPassword">
            <el-input type="password" v-model="form.oldPassword" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="form.newPassword" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input type="password" v-model="form.confirmPassword" show-password />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const formRef = ref()
const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const rules = {
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (_: any, value: string, callback: any) => {
                if (value !== form.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

const submitForm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            try {
                const res = await axios.post('/user/change-password', null, {
                    params: {
                        oldPassword: form.oldPassword,
                        newPassword: form.newPassword
                    }
                })
                if (res.data.code === 200) {
                    ElMessage.success('密码修改成功')
                    form.oldPassword = ''
                    form.newPassword = ''
                    form.confirmPassword = ''
                } else {
                    ElMessage.error(res.data.message)
                }
            } catch (err) {
                ElMessage.error('请求失败')
            }
        }
    })
}
</script>

<style scoped>
.settings-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.change-password-form {
    max-width: 500px;
    margin-top: 20px;
}
</style>