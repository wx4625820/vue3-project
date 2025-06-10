<template>
  <el-card class="resume-card">
    <h2>简历上传</h2>

    <!-- 上传简历头部 -->
    <div class="upload-header">
      <el-upload :show-file-list="false" :before-upload="beforeUpload" :http-request="handleUpload">
        <el-button type="primary">上传 PDF 简历</el-button>
      </el-upload>

      <!-- 放大按钮 -->
      <el-button circle class="icon-button" @click="dialogVisible = true">
        <el-icon>
          <FullScreen />
        </el-icon>
      </el-button>

      <!-- 清除按钮 -->
      <el-button circle class="icon-button danger" @click="resumeStore.clear()">
        <el-icon>
          <Delete />
        </el-icon>
      </el-button>
    </div>

    <!-- 简历文本框 -->
    <el-input type="textarea" v-model="resumeText" placeholder="请输入或粘贴简历内容..." :rows="10" class="resume-textarea" />

    <!-- 一键分析按钮 -->
    <div style="text-align: right; margin-top: 10px">
      <el-button type="primary" :loading="analyzing" @click="analyze">一键分析</el-button>
    </div>

    <!-- 分析结果 -->
    <el-card v-if="resultMarkdown" style="margin-top: 20px">
      <div class="markdown-body" v-html="renderedMarkdown" />
    </el-card>

    <!-- 放大编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑简历内容" width="700px">
      <el-input type="textarea" v-model="resumeText" :rows="20" placeholder="请输入或粘贴简历内容..." style="width: 100%" />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { FullScreen, Delete } from '@element-plus/icons-vue'
import * as pdfjsLib from 'pdfjs-dist'
import { marked } from 'marked'
import { useResumeStore } from '@/stores/resumeStore'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const resumeStore = useResumeStore()
const resumeText = computed({
  get: () => resumeStore.text,
  set: (val) => resumeStore.setText(val),
})
const dialogVisible = ref(false)
const analyzing = ref(false)
const resultMarkdown = ref('')

const renderedMarkdown = computed(() => marked(resultMarkdown.value))

const beforeUpload = (file: File) => {
  if (!file.name.endsWith('.pdf')) {
    ElMessage.warning('仅支持上传 PDF 文件')
    return false
  }
  return true
}

const handleUpload = async (options: any) => {
  const file = options.file as File
  const reader = new FileReader()

  reader.onload = async () => {
    try {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer)
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise
      let text = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const rawText = content.items
          .map((item: any) => (typeof item.str === 'string' ? item.str.trim() : ''))
          .join(' ')
        const pageText = rawText
          .replace(/([\u3002\uff01\uff1f!?])(?=[^\n])/g, '$1\n')
          .replace(/([.!?])(?=\s+[A-Z])/g, '$1\n')
          .replace(/(\s{2,})/g, '\n')
        text += pageText + '\n\n'
      }

      resumeText.value = text.trim()
      ElMessage.success('解析成功')
    } catch (e) {
      console.error('PDF解析失败', e)
      ElMessage.error('解析 PDF 出错')
    }
  }

  reader.onerror = () => {
    ElMessage.error('读取文件失败')
  }

  reader.readAsArrayBuffer(file)
}

const analyze = async () => {
  if (!resumeText.value.trim()) {
    ElMessage.warning('请先输入简历内容')
    return
  }

  analyzing.value = true
  resultMarkdown.value = ''

  const response = await fetch('/rag/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: resumeText.value }),
  })

  if (!response.body) {
    ElMessage.error('后端未返回内容')
    analyzing.value = false
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let queue: string[] = []
  let pushing = false

  const pushCharByChar = async () => {
    if (pushing) return
    pushing = true

    while (queue.length > 0) {
      const nextChunk = queue.shift()
      if (nextChunk) {
        for (const char of nextChunk) {
          resultMarkdown.value += char
          await new Promise(resolve => setTimeout(resolve, 20)) // 控制打字速度
        }
      }
    }

    pushing = false
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    queue.push(chunk)
    pushCharByChar() // 触发打字逻辑
  }

  analyzing.value = false
}

</script>

<style scoped>
.resume-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.icon-button {
  background-color: #f0f2f5;
  color: #333;
}

.icon-button.danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.resume-textarea {
  width: 100%;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}
</style>