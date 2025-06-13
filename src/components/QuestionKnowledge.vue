<template>
  <div class="question-wrapper">
    <h2>提问</h2>

    <!-- 输入框 -->
    <el-input v-model="question" placeholder="请输入你的问题，例如：Vue 的响应式原理是怎样的？" type="textarea" :rows="4"
      class="question-input" :disabled="typing" />

    <!-- 操作按钮 -->
    <div class="question-actions">
      <el-button type="primary" @click="submitQuestion" :disabled="typing">提问</el-button>
      <el-button @click="clearAll" :disabled="typing">清空</el-button>
    </div>

    <!-- 答案展示 -->
    <div v-if="answer" class="answer-box">
      <h4>AI 答复：</h4>
      <v-md-preview :text="answer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import request from '@/utils/request'

// markdown 渲染
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
VMdPreview.use(githubTheme, { Hljs: hljs })

const question = ref('')
const answer = ref('')
const fullAnswer = ref('')
const typing = ref(false)
let typingTimer: number | null = null

// 打字动画
const typeOutText = () => {
  let index = 0
  answer.value = ''
  typing.value = true
  if (typingTimer) clearInterval(typingTimer)
  typingTimer = window.setInterval(() => {
    if (index < fullAnswer.value.length) {
      answer.value += fullAnswer.value.charAt(index)
      index++
    } else {
      clearInterval(typingTimer!)
      typingTimer = null
      typing.value = false
    }
  }, 15)
}

// 提交提问
const submitQuestion = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入问题后再提问')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'AI 思考中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })

  try {
    const res = await request.post('/rag/ask', { question: question.value })
    const { code, data: raw, msg } = res

    if (code === 200) {
      const content = typeof raw === 'string' ? raw : JSON.stringify(raw)
      fullAnswer.value = content.replace(/<\/?think>/g, '').trim()
      typeOutText()
    } else {
      ElMessage.error(msg || '提问失败')
    }
  } catch (error: any) {
    const msg = error?.response?.data?.message || error.message || '请求异常'
    ElMessage.error(`提问失败：${msg}`)
    answer.value = `【错误】无法获取答案：${msg}`
    typing.value = false
  } finally {
    loading.close()
  }
}

// 清空
const clearAll = () => {
  question.value = ''
  fullAnswer.value = ''
  answer.value = ''
  if (typingTimer) clearInterval(typingTimer)
}
</script>

<style scoped>
.question-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
}

.question-input {
  margin-bottom: 15px;
}

.question-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.answer-box {
  background: #fff;
  border: 1px solid #e4e7ed;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

:deep(pre) {
  background-color: #f6f8fa !important;
  border-radius: 6px;
  padding: 10px;
  overflow: auto;
}
</style>
