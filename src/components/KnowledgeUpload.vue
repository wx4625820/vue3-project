<template>
    <div class="upload-wrapper">
        <h2>上传知识库</h2>
        <div class="card-tip">
            Weaviate RAG：智能向量检索+大模型问答，精准高效。
        </div>
        <el-upload class="upload-section" :http-request="handleCustomUpload" :show-file-list="true"
            :before-upload="beforeUpload" :on-success="handleSuccess" :on-error="handleError" accept=".pdf">
            <el-button type="primary">选择并上传 PDF 文件</el-button>
        </el-upload>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

/**
 * 上传前校验，只允许 PDF 文件
 */
const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf'
    if (!isPDF) {
        ElMessage.error('仅支持上传 PDF 文件')
    }
    return isPDF
}

/**
 * 自定义上传逻辑，使用相对路径调用后端接口
 */
const handleCustomUpload = async (option: any) => {
    const formData = new FormData()
    formData.append('file', option.file)

    try {
        const response = await fetch('/rag/parse-and-import', {
            method: 'POST',
            body: formData
        })

        const result = await response.json()

        if (response.ok && result.code === 200) {
            ElMessage.success(result.data || '上传成功')
            option.onSuccess(result, option.file)
        } else {
            ElMessage.error(result.msg || '上传失败')
            option.onError(new Error(result.msg || '上传失败'))
        }
    } catch (err: any) {
        console.error('上传失败:', err)
        ElMessage.error('网络或服务器错误')
        option.onError(err)
    }
}

/**
 * 成功回调
 */
const handleSuccess = () => {
    // 可扩展功能，如刷新列表等
}

/**
 * 错误回调
 */
const handleError = (err: any) => {
    console.warn('上传出错:', err)
}
</script>

<style scoped>
.upload-wrapper {
    padding: 10px 0;
}

.upload-section {
    margin-top: 20px;
}

.card-tip {
    background-color: #eef6ff;
    padding: 12px 20px;
    border-radius: 10px;
    text-align: left;
    color: #333;
    font-size: 14px;
    line-height: 1.6;
}
</style>
