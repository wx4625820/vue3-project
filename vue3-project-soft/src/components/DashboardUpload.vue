<style scoped>
/* 基础布局优化 */
.dashboard-upload-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px 5%;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f9fafb;
}

/* 标题样式 */
h2 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 30px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

/* 上传区域优化 */
.header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

/* 提示文本美化 */
.contains-wrapper {
  text-align: center;
  margin: 0 0 30px;
  padding: 16px;
  background-color: #f0fdf4;
  border-radius: 8px;
  border-left: 4px solid #10b981;
  color: #166534;
  font-size: 15px;
}

.contains {
  font-weight: 600;
  margin-right: 8px;
}

/* 分析卡片区域重构 */
.analysis-card-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
  margin: 0 0 30px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card {
  display: flex;
  align-items: center;
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 10px;
  border-left: 4px solid #409eff;
  font-size: 16px;
  font-weight: 500;
  color: #334155;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(64, 158, 255, 0.1);
}

.card-index {
  color: #409eff;
  font-weight: bold;
  margin-right: 10px;
  font-size: 18px;
}

.card-description {
  margin: 20px auto 0;
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 16px 20px;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  width: 100%;
  max-width: 1200px;
  border-left: 3px solid #60a5fa;
}

/* 进度条美化 */
:deep(.el-progress) {
  margin: 40px auto 30px !important;
  max-width: 800px;
}

:deep(.el-progress__text) {
  font-size: 16px !important;
  font-weight: 500 !important;
}

/* 视频区域布局优化 */
.video-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin: 30px 0;
  width: 100%;
}

.video-left,
.video-right {
  flex: 1;
  min-width: 300px;
}

.video-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-player {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.video-player:hover {
  transform: translateY(-2px);
}

/* 视频操作按钮区域 */
.video-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 维度说明美化 */
.dimension-explanation {
  font-size: 16px;
  line-height: 2;
  text-align: left;
  word-break: break-word;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 0;
}

.dim {
  font-weight: 600;
  margin-right: 8px;
  color: #3b82f6;
}

/* 分析结果区域 */
.analysis-result {
  margin: 30px 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.output-box {
  width: 100%;
  background: #f8fafc;
  padding: 24px;
  border-radius: 10px;
  font-size: 15px;
  color: #334155;
  line-height: 1.8;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
}

/* Markdown 样式增强 */
.stream-text h1,
.stream-text h2 {
  font-weight: 600;
  margin: 24px 0 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
  color: #1e293b;
}

.stream-text h1 {
  font-size: 22px;
}

.stream-text h2 {
  font-size: 18px;
}

.stream-text p {
  margin: 12px 0;
}

.stream-text ul {
  padding-left: 24px;
  margin: 12px 0;
}

.stream-text li {
  margin: 8px 0;
}

.stream-text strong {
  color: #1e293b;
}

.stream-text code {
  background: #f1f5f9;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 14px;
}

.stream-text pre {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 14px;
  margin: 16px 0;
}

/* 按钮样式精细化 */
.teal-button {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.teal-button:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.teal-button:disabled {
  background-color: #bfdbfe;
  border-color: #bfdbfe;
  color: #f8fafc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-button {
  background-color: #10b981;
  color: #fff;
  border-color: #10b981;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.export-button:hover {
  background-color: #059669;
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.export-button:disabled {
  background-color: #a7f3d0;
  border-color: #a7f3d0;
  color: #f8fafc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-button--danger:hover) {
  background-color: #dc2626;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

:deep(.el-select) {
  border-radius: 6px;
}

:deep(.el-input__wrapper) {
  border-radius: 6px !important;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
  border-color: #93c5fd !important;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  color: #1e293b;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px;
  font-size: 15px;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .dashboard-upload-wrapper {
    padding: 20px 3%;
  }

  .analysis-card-section {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .video-actions {
    gap: 10px;
  }

  .video-actions :deep(.el-button),
  .video-actions :deep(.el-select) {
    width: 100% !important;
    min-width: auto !important;
  }

  .output-box {
    padding: 16px;
  }
}
</style>