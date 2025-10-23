// src/utils/auth.ts
import request from './request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const checkLoginBeforeAction = async (callback: () => void) => {
  const router = useRouter()
  try {
    const res = await request.get('/user/is-login')
    if (res.code === 200 && res.data === true) {
      callback()
    } else {
      ElMessage.warning('请先登录后再操作')
      router.push('/login')
    }
  } catch (e) {
    ElMessage.error('登录校验失败')
  }
}
