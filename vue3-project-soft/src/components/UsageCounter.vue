<template>
    <div class="usage-count">
        今天已有 <strong>{{ usageCount }}</strong> 人使用
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const usageCount = ref<number | string>('—') // 初始为占位符

onMounted(async () => {
    try {
        const res = await request.get('/user/getCount')
        if (res.code === 200) {
            const match = res.data?.toString().match(/\d+/)
            if (match) {
                usageCount.value = parseInt(match[0]) + 1 // 包括当前用户
            }
        } else {
            usageCount.value = 10
        }
    } catch (e) {
        console.warn('使用次数获取失败：', e)
        usageCount.value = '加载失败'
    }
})
</script>

<style scoped>
.usage-count {
    font-size: 14px;
    color: #333;
}
</style>
