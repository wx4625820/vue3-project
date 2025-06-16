<template>
    <div class="markdown-body" v-html="renderedHtml" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{ text: string }>()

const renderedHtml = computed(() => marked(props.text || ''))
</script>

<style scoped>
.markdown-body {
    font-size: 14px;
    line-height: 1.7;
    color: #333;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
    box-sizing: border-box;
    overflow-x: auto;
    word-break: break-word;
}

.markdown-body h1 {
    font-size: 22px;
    margin: 20px 0 12px;
    border-bottom: 2px solid #eee;
    padding-bottom: 6px;
}

.markdown-body h2 {
    font-size: 18px;
    margin: 18px 0 10px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 4px;
}

.markdown-body ul {
    padding-left: 24px;
    margin-top: 6px;
}

.markdown-body li {
    margin-bottom: 6px;
}

.markdown-body strong {
    font-weight: bold;
    color: #222;
}
</style>
