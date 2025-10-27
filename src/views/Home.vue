<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="header-wrapper">
      <div class="header-nav">
        <!-- Logo 区域 -->
        <div class="logo-section">
          <img src="/logo.jpg" alt="CapVista" class="logo" />
          <span class="brand-name">CapVista</span>
        </div>

        <!-- 主导航菜单 -->
        <div class="nav-section">
          <el-menu 
            mode="horizontal" 
            :default-active="activeMenu" 
            @select="handleMenuSelect" 
            class="nav-menu"
            background-color="transparent"
            text-color="#e2e8f0"
            active-text-color="#ffffff"
          >
            <el-menu-item index="dashboard" class="nav-item">
              <el-icon><Monitor /></el-icon>
              <span>模拟面试</span>
            </el-menu-item>
            <el-menu-item index="interviews" class="nav-item">
              <el-icon><Document /></el-icon>
              <span>简历分析</span>
            </el-menu-item>
            <el-menu-item index="questions" class="nav-item">
              <el-icon><Collection /></el-icon>
              <span>知识库</span>
            </el-menu-item>
            <el-menu-item index="upload" class="nav-item">
              <el-icon><Upload /></el-icon>
              <span>上传知识库</span>
            </el-menu-item>
            <el-menu-item index="profile" class="nav-item">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜索功能、内容..."
              class="search-input"
              @input="handleSearch"
              @focus="showSearchSuggestions = true"
              @blur="hideSearchSuggestions"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            
            <!-- 搜索建议下拉框 -->
            <div v-if="showSearchSuggestions && searchSuggestions.length > 0" class="search-suggestions">
              <div
                v-for="(suggestion, index) in searchSuggestions"
                :key="index"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                <el-icon class="suggestion-icon">
                  <component :is="suggestion.icon" />
                </el-icon>
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span class="suggestion-type">{{ suggestion.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户信息区域 -->
        <div class="user-section">
          <div class="user-info">
            <div class="user-avatar">
              <el-avatar :size="40" :src="userAvatar" />
            </div>
            <div class="user-details">
              <div class="user-name">欢迎回来</div>
              <div class="user-actions">
                <UsageCounter />
              </div>
            </div>
            <!-- 主题切换按钮 -->
            <div class="theme-toggle" @click="toggleTheme">
              <el-icon v-if="isDarkMode" class="theme-icon">
                <Sunny />
              </el-icon>
              <el-icon v-else class="theme-icon">
                <Moon />
              </el-icon>
            </div>
            <el-dropdown trigger="click" @command="handleUserCommand" class="user-dropdown">
              <el-button type="text" class="user-dropdown-btn">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    账户设置
                  </el-dropdown-item>
                  <el-dropdown-item command="usage" divided>
                    <el-icon><DataAnalysis /></el-icon>
                    使用统计
                  </el-dropdown-item>
                  <el-dropdown-item command="help">
                    <el-icon><QuestionFilled /></el-icon>
                    帮助中心
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <div class="page-wrapper">
        <DashboardUpload v-if="activeMenu === 'dashboard'" />
        <ResumeUpload v-else-if="activeMenu === 'interviews'" />
        <QuestionKnowledge v-else-if="activeMenu === 'questions'" />
        <VideoUpload v-else-if="activeMenu === 'upload'" />
        <div v-else-if="activeMenu === 'profile'" class="profile-content">
          <div class="profile-header">
            <h2>个人中心</h2>
            <p>管理您的个人信息和账户设置</p>
          </div>
          <div class="profile-grid">
            <!-- 个人信息卡片 -->
            <div class="profile-card">
              <div class="card-header">
                <el-icon><User /></el-icon>
                <h3>个人信息</h3>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">用户名：</span>
                  <span class="value">用户123</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱：</span>
                  <span class="value">user@example.com</span>
                </div>
                <div class="info-item">
                  <span class="label">注册时间：</span>
                  <span class="value">2024-01-01</span>
                </div>
                <el-button type="primary" class="edit-btn">
                  <el-icon><Edit /></el-icon>
                  编辑信息
                </el-button>
              </div>
            </div>

            <!-- 账户设置卡片 -->
            <div class="profile-card">
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <h3>账户设置</h3>
              </div>
              <div class="card-content">
                <div class="setting-item">
                  <span>修改密码</span>
                  <el-button type="text" size="small">修改</el-button>
                </div>
                <div class="setting-item">
                  <span>通知设置</span>
                  <el-switch v-model="notifications" />
                </div>
                <div class="setting-item">
                  <span>隐私设置</span>
                  <el-button type="text" size="small">管理</el-button>
                </div>
              </div>
            </div>

            <!-- 使用统计卡片 -->
            <div class="profile-card">
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <h3>使用统计</h3>
              </div>
              <div class="card-content">
                <div class="stat-item">
                  <span class="stat-label">模拟面试次数</span>
                  <span class="stat-value">12</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">简历分析次数</span>
                  <span class="stat-value">8</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">知识库使用</span>
                  <span class="stat-value">25</span>
                </div>
              </div>
            </div>

            <!-- 帮助中心卡片 -->
            <div class="profile-card">
              <div class="card-header">
                <el-icon><QuestionFilled /></el-icon>
                <h3>帮助中心</h3>
              </div>
              <div class="card-content">
                <div class="help-item">
                  <el-button type="text" class="help-link">
                    <el-icon><Document /></el-icon>
                    使用指南
                  </el-button>
                </div>
                <div class="help-item">
                  <el-button type="text" class="help-link">
                    <el-icon><ChatDotRound /></el-icon>
                    常见问题
                  </el-button>
                </div>
                <div class="help-item">
                  <el-button type="text" class="help-link">
                    <el-icon><Phone /></el-icon>
                    联系我们
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Monitor, 
  Document, 
  Collection, 
  Upload, 
  Setting, 
  SwitchButton,
  User,
  ArrowDown,
  DataAnalysis,
  QuestionFilled,
  Search,
  Edit,
  ChatDotRound,
  Phone,
  Sunny,
  Moon
} from '@element-plus/icons-vue'

import DashboardUpload from '@/components/DashboardUpload.vue'
import ResumeUpload from '@/components/ResumeUpload.vue'
import QuestionKnowledge from '@/components/QuestionKnowledge.vue'
import VideoUpload from '@/components/VideoUpload.vue'
import UsageCounter from '@/components/UsageCounter.vue'

const router = useRouter()
const activeMenu = ref('dashboard')
const userAvatar = ref('')
const notifications = ref(true)

// 搜索相关状态
const searchQuery = ref('')
const showSearchSuggestions = ref(false)
const searchSuggestions = ref<any[]>([])

// 主题相关状态
const isDarkMode = ref(false)

// 搜索建议数据
const allSuggestions = [
  { text: '模拟面试', type: '功能', icon: 'Monitor', action: 'dashboard' },
  { text: '简历分析', type: '功能', icon: 'Document', action: 'interviews' },
  { text: '知识库', type: '功能', icon: 'Collection', action: 'questions' },
  { text: '上传知识库', type: '功能', icon: 'Upload', action: 'upload' },
  { text: '个人中心', type: '功能', icon: 'User', action: 'profile' },
  { text: '面试技巧', type: '内容', icon: 'ChatDotRound', action: 'search' },
  { text: '简历模板', type: '内容', icon: 'Document', action: 'search' },
  { text: '职业规划', type: '内容', icon: 'TrendCharts', action: 'search' },
  { text: '面试问题', type: '内容', icon: 'QuestionFilled', action: 'search' },
  { text: '技能提升', type: '内容', icon: 'Star', action: 'search' }
]

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 搜索处理方法
const handleSearch = () => {
  if (searchQuery.value.trim() === '') {
    searchSuggestions.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  searchSuggestions.value = allSuggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(query) ||
    suggestion.type.toLowerCase().includes(query)
  ).slice(0, 8) // 限制显示8个建议
}

// 选择搜索建议
const selectSuggestion = (suggestion: any) => {
  searchQuery.value = suggestion.text
  showSearchSuggestions.value = false
  
  if (suggestion.action !== 'search') {
    handleMenuSelect(suggestion.action)
  } else {
    // 执行搜索操作
    performSearch(suggestion.text)
  }
}

// 执行搜索
const performSearch = (query: string) => {
  ElMessage.info(`正在搜索: ${query}`)
  // 这里可以添加实际的搜索逻辑
}

// 隐藏搜索建议
const hideSearchSuggestions = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

// 主题切换方法
const toggleTheme = () => {
  // 添加旋转动画
  const themeToggle = document.querySelector('.theme-toggle')
  if (themeToggle) {
    themeToggle.classList.add('rotating')
    setTimeout(() => {
      themeToggle.classList.remove('rotating')
    }, 300)
  }
  
  isDarkMode.value = !isDarkMode.value
  updateTheme()
  ElMessage.success(isDarkMode.value ? '已切换到深色模式' : '已切换到浅色模式')
}

// 更新主题
const updateTheme = () => {
  const body = document.body
  if (isDarkMode.value) {
    body.classList.add('dark-theme')
    body.classList.remove('light-theme')
  } else {
    body.classList.add('light-theme')
    body.classList.remove('dark-theme')
  }
  // 保存主题偏好到本地存储
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 检测系统主题偏好
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'settings':
      ElMessage.info('账户设置功能开发中')
      break
    case 'usage':
      ElMessage.info('使用统计功能开发中')
      break
    case 'help':
      ElMessage.info('帮助中心功能开发中')
      break
    case 'logout':
      logout()
      break
  }
}

const logout = () => {
  router.push('/login')
}

// 组件挂载时初始化主题
onMounted(() => {
  initTheme()
})

</script>

<style scoped>
/* 导入 Inter 字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* 全局主题样式 */
:global(.light-theme) {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

:global(.dark-theme) {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

:global(body) {
  transition: background-color 0.3s ease, color 0.3s ease;
}

:global(.light-theme body) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

:global(.dark-theme body) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 头部导航栏样式 */
.header-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.logo-section:hover {
  transform: translateY(-1px);
}

.logo {
  height: 48px;
  width: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo:hover {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}

.brand-name {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #DBEAFE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Inter', sans-serif;
}

/* 导航菜单区域 */
.nav-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  background-color: transparent !important;
  border-bottom: none !important;
  height: 100%;
}

:deep(.nav-item) {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 80px;
  padding: 0 24px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9) !important;
  margin: 0 4px;
  border-radius: 12px 12px 0 0;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  min-width: 120px;
  justify-content: center;
}

:deep(.nav-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(219, 234, 254, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

:deep(.nav-item:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
  border-bottom-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(255, 255, 255, 0.15);
}

:deep(.nav-item:hover::before) {
  opacity: 1;
}

:deep(.nav-item.is-active) {
  background-color: rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
  border-bottom-color: #ffffff;
  box-shadow: 0 12px 28px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

:deep(.nav-item.is-active::before) {
  opacity: 1;
}

:deep(.nav-item .el-icon) {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
}

:deep(.nav-item:hover .el-icon) {
  transform: scale(1.1);
}

/* 用户信息区域 */
.user-section {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.user-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(219, 234, 254, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(255, 255, 255, 0.18);
}

.user-info:hover::before {
  opacity: 1;
}

.user-avatar {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.user-avatar :deep(.el-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar :deep(.el-avatar) {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
  position: relative;
  z-index: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主题切换按钮样式 */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  margin-left: 8px;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.15);
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.theme-toggle:hover::before {
  opacity: 0.1;
}

.theme-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  color: #ffffff;
  transform: scale(1.1);
}

/* 主题切换动画 */
.theme-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:active .theme-icon {
  transform: scale(0.9);
}

/* 主题切换时的旋转动画 */
.theme-toggle.rotating .theme-icon {
  animation: rotate 0.3s ease-in-out;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg); }
}

/* 搜索区域样式 */
.search-section {
  display: flex;
  align-items: center;
  margin: 0 20px;
  position: relative;
}

.search-container {
  position: relative;
  width: 280px;
}

.search-input {
  width: 100%;
}

:deep(.search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.search-input .el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:deep(.search-input .el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

:deep(.search-input .el-input__inner) {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding-left: 40px;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  z-index: 10;
  transition: all 0.3s ease;
}

:deep(.search-input .el-input__wrapper.is-focus) .search-icon {
  color: #ffffff;
  transform: translateY(-50%) scale(1.1);
}

/* 搜索建议样式 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  z-index: -1;
}

.suggestion-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.suggestion-item:hover::before {
  width: 100%;
}

.suggestion-item:hover .suggestion-text {
  color: #ffffff;
}

.suggestion-item:hover .suggestion-type {
  color: rgba(255, 255, 255, 0.8);
}

.suggestion-icon {
  margin-right: 12px;
  font-size: 16px;
  color: #667eea;
  transition: all 0.3s ease;
}

.suggestion-item:hover .suggestion-icon {
  color: #ffffff;
  transform: scale(1.1);
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.3s ease;
}

.suggestion-type {
  font-size: 12px;
  color: #6b7280;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-dropdown {
  margin-left: 4px;
  position: relative;
  z-index: 1;
}

.user-dropdown-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  position: relative;
  z-index: 1;
}

.user-dropdown-btn:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

.user-dropdown-btn .el-icon {
  font-size: 14px;
  transition: all 0.3s ease;
}

.user-dropdown-btn:hover .el-icon {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  background: #ffffff !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15) !important;
  padding: 8px 0 !important;
  backdrop-filter: blur(10px);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px !important;
  font-size: 14px;
  color: #1F2937 !important;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

:deep(.el-dropdown-menu__item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(219, 234, 254, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #DBEAFE !important;
  color: #1F2937 !important;
  transform: translateX(4px);
}

:deep(.el-dropdown-menu__item:hover::before) {
  opacity: 1;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
  color: #3B82F6;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover .el-icon) {
  transform: scale(1.1);
}

:deep(.el-dropdown-menu__item--divided) {
  border-top: 1px solid #E5E7EB !important;
  margin-top: 4px !important;
  padding-top: 12px !important;
}

:deep(.el-dropdown-menu__item:last-child) {
  color: #EF4444 !important;
}

:deep(.el-dropdown-menu__item:last-child:hover) {
  background: #FEF2F2 !important;
  color: #DC2626 !important;
}

:deep(.el-dropdown-menu__item:last-child .el-icon) {
  color: #EF4444;
}




/* 主体内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.page-wrapper {
  width: 100%;
  max-width: 1200px;
  padding: 32px;
  box-sizing: border-box;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 个人中心页面样式 */
.profile-content {
  width: 100%;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.profile-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.profile-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header .el-icon {
  font-size: 24px;
  color: #3b82f6;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-weight: 500;
  color: #475569;
}

.value {
  color: #1e293b;
  font-weight: 500;
}

.edit-btn {
  margin-top: 12px;
  width: 100%;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.setting-item:last-child {
  border-bottom: none;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8fafc;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}

.help-item {
  padding: 8px 0;
}

.help-link {
  width: 100%;
  justify-content: flex-start !important;
  color: #475569 !important;
  font-weight: 500;
}

.help-link:hover {
  color: #3b82f6 !important;
  background: #f8fafc !important;
}

.help-link .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-nav {
    padding: 0 20px;
  }
  
  :deep(.nav-item) {
    padding: 0 16px;
    font-size: 14px;
    min-width: 100px;
  }
  
  .brand-name {
    font-size: 20px;
  }
  
  .user-details {
    min-width: 100px;
  }
  
  .search-container {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .search-section {
    margin: 0 10px;
  }
  
  .search-container {
    width: 150px;
  }
  
  :deep(.search-input .el-input__inner) {
    font-size: 12px;
  }
  
  .search-suggestions {
    max-height: 200px;
  }
  
  .suggestion-item {
    padding: 8px 12px;
  }
  
  .suggestion-text {
    font-size: 12px;
  }
  
  .suggestion-type {
    font-size: 10px;
    padding: 1px 6px;
  }
}

@media (max-width: 768px) {
  .header-nav {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }
  
  .logo-section {
    margin-bottom: 12px;
  }
  
  .nav-section {
    order: 3;
    width: 100%;
    margin-top: 12px;
  }
  
  .user-section {
    margin-left: auto;
  }
  
  .user-details {
    display: none;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .page-wrapper {
    padding: 20px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .header-nav {
    padding: 8px 12px;
  }
  
  .brand-name {
    font-size: 16px;
  }
  
  .logo {
    height: 32px;
    width: 32px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .page-wrapper {
    padding: 16px;
    border-radius: 8px;
  }
}
</style>
