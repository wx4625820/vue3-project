<template>
    <div class="weather-box">
        <template v-if="weather">
            <span>{{ weather.city }} {{ weather.temp }}℃ {{ weather.text }}</span>
        </template>
        <template v-else>
            <span>加载天气中...</span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const weather = ref<null | { city: string; temp: string; text: string }>(null)

onMounted(async () => {
    try {
        // 示例使用和风天气试用 API（需申请 key）
        const res = await axios.get(
            'https://np4wct92xv.re.qweatherapi.com/v7/weather/now',
            {
                params: {
                    location: '101010100', // 北京
                    key: 'c5b01a2d27c74c35ae04b7b427ecdad4' // 替换为你自己的 key
                }
            }
        )
        const now = res.data.now
        const city = '北京'
        weather.value = {
            city,
            temp: now.temp,
            text: now.text
        }
    } catch (e) {
        console.warn('天气加载失败', e)
    }
})
</script>

<style scoped>
.weather-box {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    display: inline-block;
    /* ✅ 行内展示 */
    vertical-align: middle;
    /* ✅ 对齐文字 */
}
</style>
